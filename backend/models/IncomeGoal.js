const mongoose = require('mongoose');

const incomeGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
incomeGoalSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const IncomeGoal = mongoose.model('IncomeGoal', incomeGoalSchema);

module.exports = IncomeGoal; 