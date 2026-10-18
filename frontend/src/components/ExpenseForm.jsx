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
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState(getCurrentTime());
  const [payment, setPayment] = useState("UPI");
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

      // Tell Dashboard that a new expense was added
      if (onExpenseAdded) {
        onExpenseAdded();
      }

      alert("Expense added successfully!");

      setAmount("");
      setNotes("");

      // Reset to current date and time
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
    <div
      style={{
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px",
      }}
    >
      <h2>Quick Add Expense</h2>

      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <div style={{ marginBottom: "15px" }}>
          <label>Amount</label>
          <br />

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
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: "15px" }}>
          <label>Category</label>
          <br />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
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

        {/* Date */}
        <div style={{ marginBottom: "15px" }}>
          <label>Date</label>
          <br />

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Time */}
        <div style={{ marginBottom: "15px" }}>
          <label>Time</label>
          <br />

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Payment */}
        <div style={{ marginBottom: "15px" }}>
          <label>Payment Mode</label>
          <br />

          <select
            value={payment}
            onChange={(e) =>
              setPayment(e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          >
            <option>UPI</option>
            <option>Cash</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
          </select>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "15px" }}>
          <label>Notes</label>
          <br />

          <textarea
            placeholder="Optional notes"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows="3"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          ></textarea>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: saving
              ? "not-allowed"
              : "pointer",
          }}
        >
          {saving
            ? "Adding..."
            : "Add Expense"}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;