import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebase";
import { getExpenses } from "../services/api";

function BudgetCard() {
  const [budget, setBudget] = useState(15000);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const [newBudget, setNewBudget] = useState("");

  useEffect(() => {
    const savedBudget = localStorage.getItem("monthlyBudget");

    if (savedBudget) {
      setBudget(Number(savedBudget));
    }

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

          const monthlyExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);

            return (
              expenseDate.getMonth() === currentMonth &&
              expenseDate.getFullYear() === currentYear
            );
          });

          const total = monthlyExpenses.reduce(
            (sum, expense) =>
              sum + Number(expense.amount || 0),
            0
          );

          setSpent(total);
        } catch (error) {
          console.error(
            "Budget calculation error:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // CHANGE BUDGET
  const handleSaveBudget = () => {
    const amount = Number(newBudget);

    if (!amount || amount <= 0) {
      alert("Please enter a valid monthly budget.");
      return;
    }

    localStorage.setItem(
      "monthlyBudget",
      String(amount)
    );

    setBudget(amount);
    setNewBudget("");
    setShowBudgetEditor(false);
  };

  const remaining = Math.max(
    budget - spent,
    0
  );

  const percentage =
    budget > 0 ? (spent / budget) * 100 : 0;

  const progressPercentage =
    Math.min(percentage, 100);

  let progressColor = "#22c55e";
  let statusText = "You're doing great!";
  let statusColor = "#166534";

  if (percentage >= 100) {
    progressColor = "#ef4444";
    statusText = "Budget exceeded";
    statusColor = "#b91c1c";
  } else if (percentage >= 80) {
    progressColor = "#eab308";
    statusText = "You're close to your budget";
    statusColor = "#a16207";
  }

  if (loading) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow:
            "0 4px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Loading budget...
        </p>
      </div>
    );
  }

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow:
          "0 4px 12px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Monthly Budget
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            ₹{budget.toLocaleString("en-IN")}
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {/* CHANGE BUDGET BUTTON */}
          <button
            onClick={() => {
              setNewBudget(String(budget));
              setShowBudgetEditor(true);
            }}
            style={{
              border: "1px solid #2563eb",
              background: "#ffffff",
              color: "#2563eb",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Change Budget
          </button>

          {/* STATUS */}
          <div
            style={{
              padding: "7px 12px",
              borderRadius: "999px",
              background: `${progressColor}15`,
              color: statusColor,
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {statusText}
          </div>
        </div>
      </div>

      {/* BUDGET EDITOR */}
      {showBudgetEditor && (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Set Monthly Budget
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                overflow: "hidden",
                flex: "1 1 220px",
              }}
            >
              <span
                style={{
                  paddingLeft: "12px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                ₹
              </span>

              <input
                type="number"
                value={newBudget}
                onChange={(e) =>
                  setNewBudget(e.target.value)
                }
                placeholder="Enter monthly budget"
                min="1"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  padding: "11px 10px",
                  fontSize: "14px",
                }}
              />
            </div>

            <button
              onClick={handleSaveBudget}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Save Budget
            </button>

            <button
              onClick={() => {
                setShowBudgetEditor(false);
                setNewBudget("");
              }}
              style={{
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
                padding: "11px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Spent
          </p>

          <p
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            ₹{spent.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Remaining
          </p>

          <p
            style={{
              margin: 0,
              color:
                percentage >= 100
                  ? "#dc2626"
                  : "#111827",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            ₹{remaining.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Used
          </p>

          <p
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            {percentage.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Budget progress
          </span>

          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "9px",
            background: "#e5e7eb",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: "100%",
              background: progressColor,
              borderRadius: "999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default BudgetCard;