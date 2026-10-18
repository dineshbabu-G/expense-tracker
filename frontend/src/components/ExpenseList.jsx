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
          setExpenses(
            sortedExpenses.slice(0, 5)
          );
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
      <div style={cardStyle}>
        <p style={smallTextStyle}>
          Loading transactions...
        </p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 5px",
              fontSize: "12px",
              color: "#6b7280",
              fontWeight: "500",
            }}
          >
            Latest activity
          </p>

          <h2 style={headingStyle}>
            Recent Transactions
          </h2>
        </div>

        <span
          style={{
            padding: "6px 10px",
            background: "#f8fafc",
            borderRadius: "7px",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Latest 5
        </span>
      </div>

      {expenses.length === 0 ? (
        <div
          style={{
            padding: "35px 15px",
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: "10px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          No expenses recorded yet.
        </div>
      ) : (
        <div>
          {expenses.map((expense, index) => (
            <div
              key={expense._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                padding: "15px 0",
                borderBottom:
                  index !== expenses.length - 1
                    ? "1px solid #f1f5f9"
                    : "none",
              }}
            >
              {/* Left */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  minWidth: 0,
                }}
              >
                {/* Category Icon */}
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    minWidth: "38px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "700",
                  }}
                >
                  ₹
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#111827",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {expense.category}
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                    · {expense.payment}
                  </p>

                  {expense.notes && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#94a3b8",
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "350px",
                      }}
                    >
                      {expense.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <strong
                style={{
                  color: "#111827",
                  fontSize: "15px",
                  whiteSpace: "nowrap",
                }}
              >
                ₹
                {Number(
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

const cardStyle = {
  padding: "22px",
  background: "#ffffff",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 4px 12px rgba(15, 23, 42, 0.04)",
  boxSizing: "border-box",
};

const headingStyle = {
  margin: 0,
  fontSize: "18px",
  color: "#111827",
  fontWeight: "700",
};

const smallTextStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

export default ExpenseList;