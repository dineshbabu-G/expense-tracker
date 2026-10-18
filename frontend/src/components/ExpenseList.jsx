import { useEffect, useState } from "react";
import { getExpenses } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
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
          const data = await getExpenses(user.uid);

          // Latest expenses first
          const sortedExpenses = [...data].sort(
            (a, b) =>
              new Date(b.date) - new Date(a.date)
          );

          // Show latest 5 transactions
          setExpenses(sortedExpenses.slice(0, 5));
        } catch (error) {
          console.error(
            "Error loading recent transactions:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

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
        <h2>Recent Transactions</h2>
        <p>Loading transactions...</p>
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
      <h2>Recent Transactions</h2>

      {expenses.length === 0 ? (
        <p>No expenses recorded yet.</p>
      ) : (
        <div>
          {expenses.map((expense) => (
            <div
              key={expense._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 0",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <div>
                <strong>{expense.category}</strong>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  {expense.date
                    ? new Date(
                        expense.date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "No date"}{" "}
                  • {expense.payment}
                </p>

                {expense.notes && (
                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    {expense.notes}
                  </p>
                )}
              </div>

              <strong>
                ₹{Number(
                  expense.amount
                ).toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseList;