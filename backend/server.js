require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const notificationService = require('./services/notificationService');

const incomeRoutes = require("./routes/incomeRoutes");
const recurringBillRoutes = require("./routes/recurringBillRoutes");
const stripeRoutes = require('./routes/stripeRoutes');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notificationRoutes');
const expenseRoutes = require('./routes/expenses');
const smartSuggestionsRoutes = require('./routes/smartSuggestions');
const incomeGoalRoutes = require('./routes/incomeGoal');

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the Finance Management System API!");
});

// Routes
app.use("/api/income", incomeRoutes);
app.use("/api/recurring-bills", recurringBillRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/smart-suggestions', smartSuggestionsRoutes);
app.use('/api/income-goals', incomeGoalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Initialize notification scheduler
notificationService.scheduleBillNotifications();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
