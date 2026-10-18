const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const expenseRoutes = require("./routes/expenseRoutes");

const startReminderService = require("./services/reminderService");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Expense routes
app.use(
  "/api/expenses",
  expenseRoutes
);

// API test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "API test is working",
  });
});

// Root route
app.get("/", (req, res) => {
  res.send(
    "Expense Tracker Backend is running"
  );
});

// Connect MongoDB
connectDB();

// Start 10 PM reminder service
startReminderService();

// Server
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});