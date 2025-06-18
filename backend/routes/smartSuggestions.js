const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const axios = require('axios');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const RecurringBill = require('../models/RecurringBill');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get financial suggestions
router.get('/', async (req, res) => {
  try {
    console.log('Fetching financial data for user:', req.user._id);

    // Fetch user's financial data
    const [incomes, expenses, recurringBills] = await Promise.all([
      Income.find({ userId: req.user._id }).lean(),
      Expense.find({ userId: req.user._id }).lean(),
      RecurringBill.find({ userId: req.user._id }).lean()
    ]);

    console.log('Fetched data:', {
      incomesCount: incomes.length,
      expensesCount: expenses.length,
      recurringBillsCount: recurringBills.length
    });

    // Calculate total income
    const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Calculate total recurring bills
    const totalRecurringBills = recurringBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

    // Calculate savings rate
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses - totalRecurringBills) / totalIncome) * 100 
      : 0;

    // Prepare data for Gemini API
    const financialData = {
      totalIncome,
      totalExpenses,
      totalRecurringBills,
      savingsRate: savingsRate.toFixed(2),
      incomeSources: incomes.map(inc => ({ 
        source: inc.source || 'Unknown', 
        amount: inc.amount || 0 
      })),
      expenseCategories: expenses.reduce((acc, exp) => {
        const category = exp.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (exp.amount || 0);
        return acc;
      }, {}),
      recurringBills: recurringBills.map(bill => ({
        name: bill.name || 'Unknown',
        amount: bill.amount || 0,
        billingCycle: bill.billingCycle || 'Unknown'
      }))
    };

    console.log('Prepared financial data:', financialData);

    // Prepare prompt for Gemini API
    const prompt = `As a financial advisor, analyze this user's financial data and provide personalized advice:

Financial Overview:
- Total Monthly Income: $${financialData.totalIncome}
- Total Monthly Expenses: $${financialData.totalExpenses}
- Total Monthly Recurring Bills: $${financialData.totalRecurringBills}
- Current Savings Rate: ${financialData.savingsRate}%

Income Sources:
${financialData.incomeSources.map(inc => `- ${inc.source}: $${inc.amount}`).join('\n')}

Expense Categories:
${Object.entries(financialData.expenseCategories).map(([category, amount]) => `- ${category}: $${amount}`).join('\n')}

Recurring Bills:
${financialData.recurringBills.map(bill => `- ${bill.name}: $${bill.amount} (${bill.billingCycle})`).join('\n')}

Please provide:
1. Overall financial health assessment
2. Specific suggestions for saving money
3. Recommendations for expense reduction
4. Investment opportunities based on available funds
5. Tips for better financial management

Format the response in clear sections with bullet points for easy reading.`;

    console.log('Calling Gemini API...');
    
    // Call Gemini API with updated endpoint and model
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Gemini API response:', response.data);

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const suggestions = response.data.candidates[0].content.parts[0].text;

    res.json({
      suggestions,
      financialData
    });
  } catch (error) {
    console.error('Error getting financial suggestions:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      error: 'Failed to get financial suggestions',
      details: error.message,
      apiError: error.response?.data
    });
  }
});

module.exports = router; 