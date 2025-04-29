const IncomeModel = require("../model/Income");

exports.getAllIncome = async (req, res) => {
  try {
    const income = await IncomeModel.getAll();
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch income records" });
  }
};

exports.addIncome = async (req, res) => {
  const { source, amount, category } = req.body;
  try {
    const newIncome = await IncomeModel.create({
      source,
      amount: parseFloat(amount),
      category,
    });
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).json({ error: "Failed to add income record" });
  }
};

exports.updateIncome = async (req, res) => {
  const { id } = req.params;
  const { source, amount, category } = req.body;
  try {
    const updatedIncome = await IncomeModel.update(id, {
      source,
      amount: parseFloat(amount),
      category,
    });
    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ error: "Failed to update income record" });
  }
};

exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    await IncomeModel.delete(id);
    res.json({ message: "Income record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete income record" });
  }
};
