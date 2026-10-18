const express = require("express");

const {
  addExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const verifyFirebaseToken = require("../middleware/authMiddleware");

const router = express.Router();

// Add Expense
router.post(
  "/",
  verifyFirebaseToken,
  addExpense
);

// Get All Expenses
router.get(
  "/",
  verifyFirebaseToken,
  getExpenses
);

// Get Single Expense
router.get(
  "/:id",
  verifyFirebaseToken,
  getExpense
);

// Update Expense
router.put(
  "/:id",
  verifyFirebaseToken,
  updateExpense
);

// Delete Expense
router.delete(
  "/:id",
  verifyFirebaseToken,
  deleteExpense
);

module.exports = router;