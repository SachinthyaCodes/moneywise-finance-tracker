const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all recurring bills for the authenticated user
router.get('/', async (req, res) => {
  try {
    const bills = await prisma.recurringBill.findMany({
      where: {
        userId: req.user.id
      }
    });
    res.json(bills);
  } catch (error) {
    console.error('Error fetching recurring bills:', error);
    res.status(500).json({ error: 'Failed to fetch recurring bills' });
  }
});

// Create a new recurring bill
router.post('/', async (req, res) => {
  try {
    const { name, amount, billingCycle, startDate, dueDate, paymentMethod, autoPay } = req.body;
    
    // Convert date strings to Date objects
    const startDateTime = new Date(startDate);
    const dueDateTime = new Date(dueDate);
    
    const bill = await prisma.recurringBill.create({
      data: {
        name,
        amount,
        billingCycle,
        startDate: startDateTime,
        dueDate: dueDateTime,
        paymentMethod,
        autoPay,
        userId: req.user.id // Associate with authenticated user
      }
    });
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating recurring bill:', error);
    res.status(500).json({ error: 'Failed to create recurring bill', details: error.message });
  }
});

// Update a recurring bill
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, billingCycle, startDate, dueDate, paymentMethod, autoPay } = req.body;

    // Validate required fields
    if (!name || !amount || !billingCycle || !startDate || !dueDate || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate name (must not be just numbers)
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ error: "Name cannot be just numbers" });
    }

    // Validate amount (must be a positive number)
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Validate billing cycle
    const validBillingCycles = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
    if (!validBillingCycles.includes(billingCycle)) {
      return res.status(400).json({ error: "Invalid billing cycle" });
    }

    // Validate payment method
    const validPaymentMethods = ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    // Validate dates
    const startDateTime = new Date(startDate);
    const dueDateTime = new Date(dueDate);
    const currentDate = new Date();

    // Validate start date
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ error: "Invalid start date format" });
    }

    // Validate due date
    if (isNaN(dueDateTime.getTime())) {
      return res.status(400).json({ error: "Invalid due date format" });
    }

    // Validate due date is not in the past
    if (dueDateTime < currentDate) {
      return res.status(400).json({ error: "Due date cannot be in the past" });
    }

    // Validate due date is not before start date
    if (dueDateTime < startDateTime) {
      return res.status(400).json({ error: "Due date cannot be earlier than start date" });
    }

    // First check if the bill belongs to the authenticated user
    const existingBill = await prisma.recurringBill.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found or unauthorized' });
    }

    const bill = await prisma.recurringBill.update({
      where: { id: parseInt(id) },
      data: {
        name,
        amount: parseFloat(amount),
        billingCycle,
        startDate: startDateTime,
        dueDate: dueDateTime,
        paymentMethod,
        autoPay
      }
    });
    res.json(bill);
  } catch (error) {
    console.error('Error updating recurring bill:', error);
    res.status(500).json({ error: 'Failed to update recurring bill', details: error.message });
  }
});

// Delete a recurring bill
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the bill belongs to the authenticated user
    const existingBill = await prisma.recurringBill.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found or unauthorized' });
    }

    await prisma.recurringBill.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring bill:', error);
    res.status(500).json({ error: 'Failed to delete recurring bill' });
  }
});

module.exports = router;
