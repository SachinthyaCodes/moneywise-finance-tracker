const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Salary', 'Freelance', 'Investments', 'Business', 'Rental', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'other'],
    default: 'bank_transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled'],
    default: 'received'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
incomeSchema.virtual('formattedAmount').get(function() {
  return this.amount.toFixed(2);
});

// Virtual for formatted date
incomeSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Index for faster queries
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1 });
incomeSchema.index({ userId: 1, source: 1 });

// Pre-save middleware to update updatedAt
incomeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Income', incomeSchema); 