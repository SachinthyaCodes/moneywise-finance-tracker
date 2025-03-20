require("dotenv").config();
const express = require("express");
const cors = require("cors");

const incomeRoutes = require("./routes/incomeRoutes"); // ✅ Import Income Routes

const app = express();
app.use(cors());
app.use(express.json());

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the Finance Management System API!");
});

// ✅ Use Income Routes
app.use("/income", incomeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
