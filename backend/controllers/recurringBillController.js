const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📌 GET all recurring bills
const getAllRecurringBills = async (req, res) => {
  try {
    const bills = await prisma.recurringBill.findMany();
    res.json(bills);
  } catch (error) {
    console.error("Error fetching recurring bills:", error);
    res.status(500).json({ error: "Failed to fetch recurring bills" });
  }
};

// 📌 ADD new recurring bill
const addRecurringBill = async (req, res) => {
  try {
    const { name, amount, billingCycle, startDate, dueDate, paymentMethod, autoPay, userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!name || !amount || !billingCycle || !startDate || !dueDate || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate name (must not be just numbers)
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ error: "Name cannot be just numbers" });
    }

    // Validate amount (must be a positive number)
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Validate due date (must not be a past date)
    const currentDate = new Date();
    if (new Date(dueDate) < currentDate) {
      return res.status(400).json({ error: "Due date cannot be in the past" });
    }

    // Create new recurring bill
    const newBill = await prisma.recurringBill.create({
      data: {
        name,
        amount: parseFloat(amount),
        billingCycle,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        paymentMethod,
        autoPay,
        user: {
          connect: { id: userId }
        },
      },
    });

    res.status(201).json(newBill);
  } catch (error) {
    console.error("Error adding recurring bill:", error);
    res.status(500).json({ error: "Failed to add recurring bill" });
  }
};

// 📌 UPDATE recurring bill
const updateRecurringBill = async (req, res) => {
  try {
    const { id } = req.params;
    const billId = parseInt(id); // Ensure ID is an integer

    if (isNaN(billId)) {
      return res.status(400).json({ error: "Invalid bill ID" });
    }

    const existingBill = await prisma.recurringBill.findUnique({ where: { id: billId } });

    if (!existingBill) {
      return res.status(404).json({ error: "Recurring bill not found" });
    }

    let { name, amount, billingCycle, startDate, dueDate, paymentMethod, autoPay, userId } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }

    userId = parseInt(userId);

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // Validate name (must not be just numbers)
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ error: "Name cannot be just numbers" });
    }

    // Validate amount (must be a positive number)
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Validate due date (must not be a past date)
    const currentDate = new Date();
    if (new Date(dueDate) < currentDate) {
      return res.status(400).json({ error: "Due date cannot be in the past" });
    }

    const updatedBill = await prisma.recurringBill.update({
      where: { id: billId },
      data: {
        name,
        amount: parseFloat(amount),
        billingCycle,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        paymentMethod,
        autoPay,
        userId,
      },
    });

    res.json(updatedBill);
  } catch (error) {
    console.error("Error updating recurring bill:", error);
    res.status(500).json({ error: "Failed to update recurring bill" });
  }
};

// 📌 DELETE recurring bill
const deleteRecurringBill = async (req, res) => {
  try {
    const { id } = req.params;
    const billId = parseInt(id);

    if (isNaN(billId)) {
      return res.status(400).json({ error: "Invalid bill ID" });
    }

    await prisma.recurringBill.delete({ where: { id: billId } });

    res.json({ message: "Recurring bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting recurring bill:", error);
    res.status(500).json({ error: "Failed to delete recurring bill" });
  }
};

module.exports = {
  getAllRecurringBills,
  addRecurringBill,
  updateRecurringBill,
  deleteRecurringBill,
};
