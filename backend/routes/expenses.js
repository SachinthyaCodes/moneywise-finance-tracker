const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Get all expenses for a user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single expense
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Error fetching expense:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new expense
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, date, paymentMethod, description } = req.body;

    if (!category || !amount || !date || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newExpense = new Expense({
      userId: req.user._id,
      category,
      amount,
      date,
      paymentMethod,
      description: description || ''
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { category, amount, date, paymentMethod, description } = req.body;

    // Validate required fields
    if (!category || !amount || !date || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate amount is a number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    // Validate date format
    if (!Date.parse(date)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Find and update the expense
    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        category,
        amount,
        date,
        paymentMethod,
        description: description || ''
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Error updating expense:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 