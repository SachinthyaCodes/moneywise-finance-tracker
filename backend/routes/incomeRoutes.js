//express is imported to create the router.
//express.Router() is used to define routes.



const express = require("express");
const router = express.Router();
const {
  getAllIncome,
  addIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");  // ✅ Import controller functions

router.get("/", getAllIncome);
router.post("/", addIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;
