const cron = require("node-cron");
const Expense = require("../models/Expense");

const startReminderService = () => {
  cron.schedule(
    "0 22 * * *",
    async () => {
      console.log(
        "10 PM expense reminder check started..."
      );

      try {
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const todaysExpenses =
          await Expense.find({
            date: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          });

        console.log(
          `Today's expenses: ${todaysExpenses.length}`
        );

        if (todaysExpenses.length === 0) {
          console.log(
            "Reminder: Have you recorded today's expenses?"
          );
        } else {
          console.log(
            "Today's expenses already recorded."
          );
        }
      } catch (error) {
        console.error(
          "Reminder service error:",
          error.message
        );
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "10 PM reminder service started."
  );
};

module.exports = startReminderService;