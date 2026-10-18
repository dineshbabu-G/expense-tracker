import { useEffect, useState } from "react";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Expenses() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    date: "",
    time: "",
    payment: "UPI",
    notes: "",
  });

  // Check Firebase login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Firebase user:", currentUser);

      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load expenses after user is available
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    loadExpenses();
  }, [authLoading, user]);

  // Get expenses
  const loadExpenses = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      const data = await getExpenses(user.uid);

      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      amount: "",
      category: "Food",
      date: "",
      time: "",
      payment: "UPI",
      notes: "",
    });

    setEditingId(null);
  };

  // Add / Update expense
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      const expenseData = {
        userId: user.uid,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        time: form.time,
        payment: form.payment,
        notes: form.notes,
      };

      if (editingId) {
        await updateExpense(editingId, expenseData);

        alert("Expense updated successfully!");
      } else {
        await addExpense(expenseData);

        alert("Expense added successfully!");
      }

      resetForm();

      await loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);

      alert(error.message);
    }
  };

  // Edit expense
  const handleEdit = (expense) => {
    setEditingId(expense._id);

    setForm({
      amount: expense.amount,
      category: expense.category,
      date: expense.date
        ? expense.date.substring(0, 10)
        : "",
      time: expense.time || "",
      payment: expense.payment,
      notes: expense.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete expense
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteExpense(id);

      alert("Expense deleted successfully!");

      await loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);

      alert(error.message);
    }
  };

  // Authentication loading
  if (authLoading) {
    return <h1>Checking login...</h1>;
  }

  // User not logged in
  if (!user) {
    return <h1>Please login first.</h1>;
  }

  // Expenses loading
  if (loading) {
    return <h1>Loading expenses...</h1>;
  }

  return (
    <div>
      <h1>Expenses Page</h1>

      <h2>
        {editingId ? "Edit Expense" : "Add Expense"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Bills</option>
          <option>Rent</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>

        <br />
        <br />

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        {/* Time */}
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        {/* Payment */}
        <select
          name="payment"
          value={form.payment}
          onChange={handleChange}
        >
          <option>UPI</option>
          <option>Cash</option>
          <option>Credit Card</option>
          <option>Debit Card</option>
        </select>

        <br />
        <br />

        {/* Notes */}
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        <br />
        <br />

        {/* Submit */}
        <button type="submit">
          {editingId ? "Update Expense" : "Add Expense"}
        </button>

        {editingId && (
          <>
            {" "}

            <button
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </>
        )}
      </form>

      <hr />

      <h2>Expenses</h2>

      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        expenses.map((expense) => (
          <div key={expense._id}>
            <p>
              <strong>Amount:</strong> ₹{expense.amount}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {expense.category}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {expense.date
                ? expense.date.substring(0, 10)
                : ""}
            </p>

            <p>
              <strong>Time:</strong> {expense.time}
            </p>

            <p>
              <strong>Payment:</strong>{" "}
              {expense.payment}
            </p>

            <p>
              <strong>Notes:</strong>{" "}
              {expense.notes}
            </p>

            <button
              onClick={() => handleEdit(expense)}
            >
              Edit
            </button>

            {" "}

            <button
              onClick={() =>
                handleDelete(expense._id)
              }
            >
              Delete
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Expenses;