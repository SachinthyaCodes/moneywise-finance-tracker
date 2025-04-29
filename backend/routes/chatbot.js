const express = require("express");
const axios = require("axios");
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const requestBody = {
            contents: [{ parts: [{ text: `${message}` }] }]
        };

        const response = await axios.post(apiUrl, requestBody, {
            headers: { "Content-Type": "application/json" }
        });

        res.json({ reply: response.data.candidates[0].content.parts[0].text });
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch response from AI" });
    }
});

module.exports = router;