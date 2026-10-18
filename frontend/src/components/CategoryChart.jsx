import { useEffect, useState } from "react";
import { getExpenses } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function CategoryChart() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const expenses = await getExpenses(user.uid);

          const now = new Date();

          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();

          const categoryNames = [
            "Food",
            "Travel",
            "Bills",
            "Rent",
            "Shopping",
            "Entertainment",
            "Other",
          ];

          const categoryTotals = {};

          categoryNames.forEach((category) => {
            categoryTotals[category] = 0;
          });

          expenses.forEach((expense) => {
            const expenseDate = new Date(expense.date);

            const isCurrentMonth =
              expenseDate.getFullYear() === currentYear &&
              expenseDate.getMonth() === currentMonth;

            if (isCurrentMonth) {
              categoryTotals[expense.category] +=
                Number(expense.amount);
            }
          });

          const categoryData = categoryNames.map(
            (category) => ({
              name: category,
              amount: categoryTotals[category],
            })
          );

          setCategories(categoryData);
        } catch (error) {
          console.error(
            "Error loading category data:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const total = categories.reduce(
    (sum, category) => sum + category.amount,
    0
  );

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
        <h2>Spending by Category</h2>
        <p>Loading category data...</p>
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
      <h2>Spending by Category</h2>

      <p>
        Total Spent:{" "}
        <strong>₹{total.toLocaleString()}</strong>
      </p>

      {total === 0 ? (
        <p>No expenses recorded for this month.</p>
      ) : (
        <div>
          {categories.map((category) => {
            const percentage =
              total > 0
                ? (category.amount / total) * 100
                : 0;

            return (
              <div
                key={category.name}
                style={{
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>{category.name}</span>

                  <span>
                    ₹{category.amount.toLocaleString()} (
                    {percentage.toFixed(1)}%)
                  </span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    background: "#e5e7eb",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "#2563eb",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryChart;