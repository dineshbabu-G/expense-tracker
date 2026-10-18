const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Travel",
        "Bills",
        "Rent",
        "Shopping",
        "Entertainment",
        "Other",
      ],
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
    },

    payment: {
      type: String,
      required: true,
      enum: [
        "UPI",
        "Cash",
        "Credit Card",
        "Debit Card",
      ],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;