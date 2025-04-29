const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");

// 📌 GET All Income Records
router.get("/", incomeController.getAllIncome);

// 📌 ADD Income Record
router.post("/", incomeController.addIncome);

// 📌 UPDATE Income Record
router.put("/:id", incomeController.updateIncome);

// 📌 DELETE Income Record
router.delete("/:id", incomeController.deleteIncome);

module.exports = router;
