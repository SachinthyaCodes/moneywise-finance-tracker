const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

// 📌 GET All Expense Records
router.get("/", expenseController.getAllExpenses);

// 📌 ADD Expense Record
router.post("/", expenseController.addExpense);

// 📌 UPDATE Expense Record
router.put("/:id", expenseController.updateExpense);

// 📌 DELETE Expense Record
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
