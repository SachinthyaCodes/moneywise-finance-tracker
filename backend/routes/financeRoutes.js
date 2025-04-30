const express = require("express");
const { getFinancialSuggestions } = require("../controllers/financeController");

const router = express.Router();

router.post("/get-suggestions", getFinancialSuggestions);

module.exports = router;
