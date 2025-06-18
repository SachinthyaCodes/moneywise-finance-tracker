const IncomeGoal = require('../models/IncomeGoal');
const Income = require('../models/Income'); // Assuming you have an Income model

// Create or update income goal
exports.setIncomeGoal = async (req, res) => {
    try {
        const { targetAmount, month, year } = req.body;
        const userId = req.user._id; // Assuming you have user authentication middleware

        // Check if goal already exists for the month
        let incomeGoal = await IncomeGoal.findOne({
            userId,
            month,
            year
        });

        if (incomeGoal) {
            // Update existing goal
            incomeGoal.targetAmount = targetAmount;
            await incomeGoal.save();
        } else {
            // Create new goal
            incomeGoal = new IncomeGoal({
                userId,
                targetAmount,
                month,
                year
            });
            await incomeGoal.save();
        }

        res.status(200).json({
            success: true,
            data: incomeGoal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get income goal with progress
exports.getIncomeGoal = async (req, res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user._id;

        // Get the income goal
        const incomeGoal = await IncomeGoal.findOne({
            userId,
            month: parseInt(month),
            year: parseInt(year)
        });

        if (!incomeGoal) {
            return res.status(404).json({
                success: false,
                message: 'No income goal found for this period'
            });
        }

        // Calculate total income for the period
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const totalIncome = await Income.aggregate([
            {
                $match: {
                    userId: userId,
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const currentIncome = totalIncome.length > 0 ? totalIncome[0].total : 0;
        const progress = (currentIncome / incomeGoal.targetAmount) * 100;

        res.status(200).json({
            success: true,
            data: {
                goal: incomeGoal,
                currentIncome,
                progress: Math.min(progress, 100),
                remaining: Math.max(incomeGoal.targetAmount - currentIncome, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 