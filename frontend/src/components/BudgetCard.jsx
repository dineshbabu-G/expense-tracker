import { useEffect, useState } from "react";
import { getExpenses } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function BudgetCard() {
  const [budget, setBudget] = useState(15000);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedBudget =
      localStorage.getItem("monthlyBudget");

    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);

          const expenses = await getExpenses(
            user.uid
          );

          const now = new Date();

          const currentYear =
            now.getFullYear();

          const currentMonth =
            now.getMonth();

          const currentMonthExpenses =
            expenses.filter((expense) => {
              const expenseDate =
                new Date(expense.date);

              return (
                expenseDate.getFullYear() ===
                  currentYear &&
                expenseDate.getMonth() ===
                  currentMonth
              );
            });

          const totalSpent =
            currentMonthExpenses.reduce(
              (total, expense) =>
                total +
                Number(expense.amount),
              0
            );

          setSpent(totalSpent);
        } catch (error) {
          console.error(
            "Error loading budget data:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const remaining = budget - spent;

  const percentage =
    budget > 0
      ? (spent / budget) * 100
      : 0;

  const progressPercentage = Math.min(
    percentage,
    100
  );

  let progressColor = "#22c55e";

  if (percentage >= 100) {
    progressColor = "#ef4444";
  } else if (percentage >= 80) {
    progressColor = "#eab308";
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "20px",
        }}
      >
        <h2>Monthly Budget</h2>
        <p>Loading budget...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px",
      }}
    >
      <h2>Monthly Budget</h2>

      <p>
        Budget: ₹
        {budget.toLocaleString()}
      </p>

      <p>
        Spent: ₹
        {spent.toLocaleString()}
      </p>

      <p>
        Remaining: ₹
        {remaining.toLocaleString()}
      </p>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#e5e7eb",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            background: progressColor,
            transition:
              "width 0.3s ease",
          }}
        ></div>
      </div>

      <p>
        {percentage.toFixed(0)}% used
      </p>

      {percentage >= 100 && (
        <p style={{ color: "#ef4444" }}>
          Budget exceeded!
        </p>
      )}

      {percentage >= 80 &&
        percentage < 100 && (
          <p style={{ color: "#ca8a04" }}>
            You have used 80% or more of
            your budget.
          </p>
        )}
    </div>
  );
}

export default BudgetCard;