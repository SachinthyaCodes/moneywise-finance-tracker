const express = require("express");
const { getIncomeRecords, getIncomeById } = require("../controllers/userController");

const router = express.Router();

router.get("/income", getIncomeRecords);
router.get("/income/:id", getIncomeById);

module.exports = router; 