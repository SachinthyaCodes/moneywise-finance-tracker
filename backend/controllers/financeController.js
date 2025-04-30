const pool = require("../database");
const axios = require("axios");

const getFinancialSuggestions = async (req, res) => {
  const userId = req.body.userId;

  try {
    // Fetch past records from PostgreSQL
    const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1", [userId]);
    const transactions = result.rows;

    if (transactions.length === 0) {
      return res.json({ message: "No transaction data found" });
    }

    // Format transactions into text
    const transactionText = transactions
      .map(t => `Category: ${t.category}, Amount: $${t.amount}, Date: ${t.date}`)
      .join("\n");

    // AI API Request
    const AI_PROMPT = `Analyze the following past financial transactions and provide smart budgeting suggestions:\n${transactionText}`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: AI_PROMPT }] }]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // Extract AI-generated suggestions
    const aiResponse = response.data.candidates[0]?.content?.parts[0]?.text || "No suggestions available";

    res.json({ suggestions: aiResponse });

    

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getFinancialSuggestions };
