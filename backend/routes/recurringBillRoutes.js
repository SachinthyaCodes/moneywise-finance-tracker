const express = require("express");
const router = express.Router();
const RecurringBill = require('../models/RecurringBill');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all recurring bills for the authenticated user
router.get('/', async (req, res) => {
  try {
    const bills = await RecurringBill.find({ userId: req.user._id })
      .sort({ dueDate: 1 }); // Sort by due date
    res.json(bills);
  } catch (error) {
    console.error('Error fetching recurring bills:', error);
    res.status(500).json({ error: 'Failed to fetch recurring bills' });
  }
});

// Add new recurring bill
router.post('/', async (req, res) => {
  try {
    const {
      name,
      amount,
      billingCycle,
      startDate,
      dueDate,
      paymentMethod,
      autoPay
    } = req.body;

    // Validate required fields
    if (!name || !amount || !billingCycle || !startDate || !dueDate || !paymentMethod) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const due = new Date(dueDate);
    
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (due <= start) {
      return res.status(400).json({ error: 'Due date must be after start date' });
    }

    const newBill = new RecurringBill({
      name,
      amount,
      billingCycle,
      startDate: start,
      dueDate: due,
      paymentMethod,
      autoPay: autoPay || false,
      userId: req.user._id,
      paymentStatus: 'PENDING'
    });

    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    console.error('Error adding recurring bill:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add recurring bill' });
  }
});

// Update recurring bill
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      amount,
      billingCycle,
      startDate,
      dueDate,
      paymentMethod,
      autoPay
    } = req.body;

    // Validate dates if provided
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      if (isNaN(start.getTime()) || isNaN(due.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      if (due <= start) {
        return res.status(400).json({ error: 'Due date must be after start date' });
      }
    }

    const bill = await RecurringBill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(name && { name }),
        ...(amount && { amount }),
        ...(billingCycle && { billingCycle }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(paymentMethod && { paymentMethod }),
        ...(typeof autoPay === 'boolean' && { autoPay })
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!bill) {
      return res.status(404).json({ error: 'Recurring bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Error updating recurring bill:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update recurring bill' });
  }
});

// Delete recurring bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await RecurringBill.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({ error: 'Recurring bill not found' });
    }

    res.json({ message: 'Recurring bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring bill:', error);
    res.status(500).json({ error: 'Failed to delete recurring bill' });
  }
});

module.exports = router;
