import { useEffect, useState } from "react";
import { getExpenses } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function SpendingChart() {
  const [spendingData, setSpendingData] = useState([]);
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

          // Find Monday of current week
          const monday = new Date(today);
          const day = monday.getDay();

          const difference =
            day === 0 ? 6 : day - 1;

          monday.setDate(
            monday.getDate() - difference
          );

          monday.setHours(0, 0, 0, 0);

          const dayNames = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ];

          const weeklyData = dayNames.map(
            (dayName, index) => {
              const currentDay = new Date(monday);

              currentDay.setDate(
                monday.getDate() + index
              );

              currentDay.setHours(0, 0, 0, 0);

              const nextDay = new Date(currentDay);

              nextDay.setDate(
                currentDay.getDate() + 1
              );

              const amount = expenses
                .filter((expense) => {
                  const expenseDate = new Date(
                    expense.date
                  );

                  return (
                    expenseDate >= currentDay &&
                    expenseDate < nextDay
                  );
                })
                .reduce(
                  (total, expense) =>
                    total + Number(expense.amount),
                  0
                );

              return {
                day: dayName,
                amount,
              };
            }
          );

          setSpendingData(weeklyData);
        } catch (error) {
          console.error(
            "Error loading spending data:",
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
    ...spendingData.map((item) => item.amount),
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
        <h2>Daily Spending Trend</h2>
        <p>Loading spending data...</p>
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
      <h2>Daily Spending Trend</h2>

      {maxAmount === 0 ? (
        <p>No spending recorded this week.</p>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "15px",
            height: "220px",
            padding: "20px 10px 0",
          }}
        >
          {spendingData.map((item) => {
            const height =
              maxAmount > 0
                ? (item.amount / maxAmount) * 160
                : 0;

            return (
              <div
                key={item.day}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%",
                }}
              >
                <span
                  style={{
                    marginBottom: "5px",
                    fontSize: "12px",
                  }}
                >
                  ₹{item.amount.toLocaleString()}
                </span>

                <div
                  style={{
                    width: "100%",
                    maxWidth: "45px",
                    height: `${height}px`,
                    background: "#2563eb",
                    borderRadius: "6px 6px 0 0",
                    minHeight:
                      item.amount > 0 ? "5px" : "0px",
                  }}
                ></div>

                <span
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                  }}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SpendingChart;