import { useEffect, useState } from "react";
import { addExpense } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const now = new Date();

  return `${String(
    now.getHours()
  ).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

function ExpenseForm({ onExpenseAdded }) {
  const [user, setUser] = useState(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState("Food");
  const [date, setDate] =
    useState(getTodayDate());
  const [time, setTime] =
    useState(getCurrentTime());
  const [payment, setPayment] =
    useState("UPI");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      setSaving(true);

      const expenseData = {
        userId: user.uid,
        amount: Number(amount),
        category,
        date,
        time,
        payment,
        notes,
      };

      await addExpense(expenseData);

      if (onExpenseAdded) {
        onExpenseAdded();
      }

      alert("Expense added successfully!");

      setAmount("");
      setNotes("");
      setDate(getTodayDate());
      setTime(getCurrentTime());
    } catch (error) {
      console.error(
        "Error adding expense:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ marginBottom: "22px" }}>
        <p
          style={{
            margin: "0 0 5px",
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: "500",
          }}
        >
          Record a new transaction
        </p>

        <h2 style={headingStyle}>
          Quick Add Expense
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Amount
          </label>

          <div
            style={{
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              ₹
            </span>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              required
              min="1"
              style={{
                ...inputStyle,
                paddingLeft: "32px",
              }}
            />
          </div>
        </div>

        {/* Category + Payment */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              style={inputStyle}
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Bills</option>
              <option>Rent</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Payment Mode
            </label>

            <select
              value={payment}
              onChange={(e) =>
                setPayment(e.target.value)
              }
              style={inputStyle}
            >
              <option>UPI</option>
              <option>Cash</option>
              <option>Credit Card</option>
              <option>Debit Card</option>
            </select>
          </div>
        </div>

        {/* Date + Time */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Time
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Notes
          </label>

          <textarea
            placeholder="Add a note (optional)"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows="3"
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "85px",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "12px 18px",
            border: "none",
            borderRadius: "9px",
            background: saving
              ? "#93c5fd"
              : "#2563eb",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: saving
              ? "not-allowed"
              : "pointer",
            transition:
              "background 0.2s ease",
          }}
        >
          {saving
            ? "Adding Expense..."
            : "Add Expense"}
        </button>
      </form>
    </div>
  );
}

const cardStyle = {
  padding: "24px",
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

const fieldStyle = {
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#374151",
  fontSize: "13px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export default ExpenseForm;