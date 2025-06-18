const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all income entries
router.get('/', async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

// Add new income
router.post('/', async (req, res) => {
  try {
    const { category, amount, source, date } = req.body;
    const newIncome = new Income({
      category,
      amount,
      source,
      date: date || new Date(),
      userId: req.user._id
    });
    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ error: 'Failed to add income' });
  }
});

// Update income
router.put('/:id', async (req, res) => {
  try {
    const { category, amount, source, date } = req.body;
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { category, amount, source, date },
      { new: true }
    );
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
});

// Delete income
router.delete('/:id', async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// Get income analytics
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const income = await Income.find(query);

    // Calculate total income
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

    // Calculate average income
    const averageIncome = totalIncome / (income.length || 1);

    // Calculate income by category
    const incomeByCategory = income.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    // Calculate monthly income
    const monthlyIncome = income.reduce((acc, item) => {
      const date = new Date(item.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + item.amount;
      return acc;
    }, {});

    res.json({
      totalIncome,
      averageIncome,
      incomeByCategory,
      monthlyIncome,
      totalEntries: income.length
    });
  } catch (error) {
    console.error('Error fetching income analytics:', error);
    res.status(500).json({ error: 'Failed to fetch income analytics' });
  }
});

// Get income report
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const income = await Income.find(query).sort({ date: -1 });

    // Calculate summary statistics
    const summary = {
      totalIncome: income.reduce((sum, item) => sum + item.amount, 0),
      averageIncome: income.reduce((sum, item) => sum + item.amount, 0) / (income.length || 1),
      totalEntries: income.length,
      dateRange: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null
      }
    };

    res.json({
      summary,
      income
    });
  } catch (error) {
    console.error('Error generating income report:', error);
    res.status(500).json({ error: 'Failed to generate income report' });
  }
});

module.exports = router;
