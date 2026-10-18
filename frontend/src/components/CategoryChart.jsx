import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebase";
import { getExpenses } from "../services/api";

function CategoryChart() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Food",
    "Travel",
    "Bills",
    "Rent",
    "Shopping",
    "Entertainment",
    "Other",
  ];

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
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const monthlyExpenses = expenses.filter(
            (expense) => {
              const expenseDate = new Date(expense.date);

              return (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
              );
            }
          );

          const totals = {};

          categories.forEach((category) => {
            totals[category] = 0;
          });

          monthlyExpenses.forEach((expense) => {
            const category =
              categories.includes(expense.category)
                ? expense.category
                : "Other";

            totals[category] += Number(
              expense.amount || 0
            );
          });

          const totalAmount = Object.values(totals).reduce(
            (sum, value) => sum + value,
            0
          );

          const data = categories
            .map((category) => ({
              category,
              amount: totals[category],
              percentage:
                totalAmount > 0
                  ? (totals[category] / totalAmount) * 100
                  : 0,
            }))
            .filter((item) => item.amount > 0)
            .sort((a, b) => b.amount - a.amount);

          setCategoryData(data);
        } catch (error) {
          console.error(
            "Category chart error:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "24px",
        boxShadow:
          "0 4px 12px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Spending by Category
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          This month's spending breakdown
        </p>
      </div>

      {loading ? (
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Loading category data...
        </p>
      ) : categoryData.length === 0 ? (
        <div
          style={{
            padding: "30px 10px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          No expenses recorded this month.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {categoryData.map((item) => (
            <div key={item.category}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  {item.category}
                </span>

                <span
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  ₹
                  {item.amount.toLocaleString(
                    "en-IN"
                  )}{" "}
                  · {item.percentage.toFixed(0)}%
                </span>
              </div>

              <div
                style={{
                  height: "8px",
                  background: "#eef2f7",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.percentage}%`,
                    height: "100%",
                    background: "#2563eb",
                    borderRadius: "999px",
                    transition:
                      "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryChart;