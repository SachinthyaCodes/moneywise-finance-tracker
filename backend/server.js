require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require('helmet');

const incomeRoutes = require("./routes/incomeRoutes"); // ✅ Import Income Routes
const recurringBillRoutes = require("./routes/recurringBillRoutes"); // ✅ Import Recurring Bill Routes
const stripeRoutes = require('./routes/stripeRoutes');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const notificationRoutes = require('./routes/notificationRoutes');
const { startNotificationCron } = require('./cron/notificationCron');

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

// ✅ Use Income Routes
app.use("/api/income", incomeRoutes);

// ✅ Use Recurring Bill Routes
app.use("/api/recurring-bills", recurringBillRoutes);

// Stripe webhook endpoint needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use('/api/stripe', stripeRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Protected routes example
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// 🚨 Error Handling Middleware (Add this)
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.stack);  // Log the full error
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Start the notification cron job
startNotificationCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
