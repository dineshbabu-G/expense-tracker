import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebase";
import { getExpenses } from "../services/api";

function SpendingChart() {
  const [dailyData, setDailyData] = useState([]);
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

          const today = new Date();

          const monday = new Date(today);
          const day = monday.getDay();

          const difference =
            day === 0 ? 6 : day - 1;

          monday.setDate(
            monday.getDate() - difference
          );

          monday.setHours(0, 0, 0, 0);

          const days = [];

          for (let i = 0; i < 7; i++) {
            const date = new Date(monday);

            date.setDate(
              monday.getDate() + i
            );

            days.push({
              date,
              amount: 0,
            });
          }

          expenses.forEach((expense) => {
            const expenseDate = new Date(
              expense.date
            );

            expenseDate.setHours(0, 0, 0, 0);

            days.forEach((dayData) => {
              if (
                expenseDate.getTime() ===
                dayData.date.getTime()
              ) {
                dayData.amount += Number(
                  expense.amount || 0
                );
              }
            });
          });

          const formattedData = days.map(
            (dayData) => ({
              label: dayData.date.toLocaleDateString(
                "en-IN",
                {
                  weekday: "short",
                }
              ),
              date: dayData.date.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                }
              ),
              amount: dayData.amount,
            })
          );

          setDailyData(formattedData);
        } catch (error) {
          console.error(
            "Spending chart error:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const maxAmount = Math.max(
    ...dailyData.map((item) => item.amount),
    1
  );

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
          Weekly Spending
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Monday to Sunday
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
          Loading spending data...
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            height: "220px",
            overflowX: "auto",
            paddingTop: "10px",
          }}
        >
          {dailyData.map((item) => {
            const barHeight =
              item.amount > 0
                ? Math.max(
                    (item.amount / maxAmount) * 150,
                    12
                  )
                : 5;

            return (
              <div
                key={item.date}
                style={{
                  flex: "1 0 55px",
                  minWidth: "55px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    minHeight: "15px",
                  }}
                >
                  {item.amount > 0
                    ? `₹${item.amount.toLocaleString(
                        "en-IN"
                      )}`
                    : ""}
                </span>

                <div
                  title={`${item.date}: ₹${item.amount.toLocaleString(
                    "en-IN"
                  )}`}
                  style={{
                    width: "30px",
                    height: `${barHeight}px`,
                    background: "#2563eb",
                    borderRadius:
                      "7px 7px 3px 3px",
                    transition:
                      "height 0.3s ease",
                  }}
                />

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SpendingChart;