const mongoose = require('mongoose');

const recurringBillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bill name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  billingCycle: {
    type: String,
    enum: {
      values: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      message: '{VALUE} is not a valid billing cycle'
    },
    required: [true, 'Billing cycle is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Invalid start date'
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Invalid due date'
    }
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'],
      message: '{VALUE} is not a valid payment method'
    },
    required: [true, 'Payment method is required']
  },
  autoPay: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeSubscriptionId: String,
  stripePaymentMethodId: String,
  lastPaymentDate: Date,
  paymentStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'PENDING'
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

// Add validation to ensure dueDate is after startDate
recurringBillSchema.pre('save', function(next) {
  if (this.dueDate <= this.startDate) {
    next(new Error('Due date must be after start date'));
  }
  next();
});

// Add virtual for next payment date
recurringBillSchema.virtual('nextPaymentDate').get(function() {
  if (!this.lastPaymentDate) return this.startDate;
  
  const lastDate = new Date(this.lastPaymentDate);
  switch (this.billingCycle) {
    case 'DAILY':
      return new Date(lastDate.setDate(lastDate.getDate() + 1));
    case 'WEEKLY':
      return new Date(lastDate.setDate(lastDate.getDate() + 7));
    case 'MONTHLY':
      return new Date(lastDate.setMonth(lastDate.getMonth() + 1));
    case 'YEARLY':
      return new Date(lastDate.setFullYear(lastDate.getFullYear() + 1));
    default:
      return null;
  }
});

module.exports = mongoose.model('RecurringBill', recurringBillSchema); 