const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all income entries for the authenticated user
router.get('/', async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      where: {
        userId: req.user.id
      }
    });
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching income entries:', error);
    res.status(500).json({ error: 'Failed to fetch income entries' });
  }
});

// Create a new income entry
router.post('/', async (req, res) => {
  try {
    const { category, amount, source, date } = req.body;
    const income = await prisma.income.create({
      data: {
        category,
        amount,
        source,
        date,
        userId: req.user.id // Associate with authenticated user
      }
    });
    res.status(201).json(income);
  } catch (error) {
    console.error('Error creating income entry:', error);
    res.status(500).json({ error: 'Failed to create income entry' });
  }
});

// Update an income entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, source, date } = req.body;

    // First check if the income entry belongs to the authenticated user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income entry not found or unauthorized' });
    }

    const income = await prisma.income.update({
      where: { id },
      data: {
        category,
        amount,
        source,
        date
      }
    });
    res.json(income);
  } catch (error) {
    console.error('Error updating income entry:', error);
    res.status(500).json({ error: 'Failed to update income entry' });
  }
});

// Delete an income entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the income entry belongs to the authenticated user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income entry not found or unauthorized' });
    }

    await prisma.income.delete({
      where: { id }
    });
    res.json({ message: 'Income entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting income entry:', error);
    res.status(500).json({ error: 'Failed to delete income entry' });
  }
});

module.exports = router;
