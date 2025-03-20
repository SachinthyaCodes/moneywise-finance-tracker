const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 📌 GET All Income Records
router.get("/", async (req, res) => {
  try {
    const income = await prisma.income.findMany();
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch income records" });
  }
});

// 📌 ADD Income Record
router.post("/", async (req, res) => {
  const { source, amount, category } = req.body;
  try {
    const newIncome = await prisma.income.create({
      data: { source, amount: parseFloat(amount), category },
    });
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).json({ error: "Failed to add income record" });
  }
});

// 📌 UPDATE Income Record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { source, amount, category } = req.body;
  try {
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: { source, amount: parseFloat(amount), category },
    });
    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ error: "Failed to update income record" });
  }
});

// 📌 DELETE Income Record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.income.delete({ where: { id } });
    res.json({ message: "Income record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete income record" });
  }
});

module.exports = router;
