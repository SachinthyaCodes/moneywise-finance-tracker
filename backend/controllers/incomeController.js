const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 📌 GET all income records
const getAllIncome = async (req, res) => {
  try {
    const income = await prisma.income.findMany();
    res.json(income);
  } catch (error) {
    console.error("Error fetching income records:", error);
    res.status(500).json({ error: "Failed to fetch income records" });
  }
};

// 📌 ADD new income recordz
const addIncome = async (req, res) => {
  const { source, amount, category } = req.body;
  try {
    const newIncome = await prisma.income.create({
      data: { source, amount: parseFloat(amount), category },
    });
    res.status(201).json(newIncome);
  } catch (error) {
    console.error("Error adding income record:", error);
    res.status(500).json({ error: "Failed to add income record" });
  }
};

// 📌 UPDATE income record
const updateIncome = async (req, res) => {
  const { id } = req.params;
  const { source, amount, category } = req.body;
  try {
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: { source, amount: parseFloat(amount), category },
    });
    res.json(updatedIncome);
  } catch (error) {
    console.error("Error updating income record:", error);
    res.status(500).json({ error: "Failed to update income record" });
  }
};

// 📌 DELETE income record
const deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.income.delete({ where: { id } });
    res.json({ message: "Income record deleted successfully" });
  } catch (error) {
    console.error("Error deleting income record:", error);
    res.status(500).json({ error: "Failed to delete income record" });
  }
};

module.exports = {
  getAllIncome,
  addIncome,
  updateIncome,
  deleteIncome,
};
