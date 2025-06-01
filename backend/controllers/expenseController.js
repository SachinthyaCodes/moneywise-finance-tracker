const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expense records...!" });
  }
};

exports.addExpense = async (req, res) => {
  const { category, amount, date, method } = req.body;
  try {
    const newExpense = await prisma.expense.create({
      data: { category, amount: parseFloat(amount), date: new Date(date), method },
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to add expense record...!" });
  }
};

exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { category, amount, date, method } = req.body;
  try {
    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: { category, amount: parseFloat(amount), date: new Date(date), method },
    });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to update expense record" });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Expense record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete expense record" });
  }
};
