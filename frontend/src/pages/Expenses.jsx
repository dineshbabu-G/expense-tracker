import { useEffect, useState } from "react";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

  const loadExpenses = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      const data = await getExpenses(user.uid);

      setExpenses(data);
    } catch (error) {
      console.error(
        "Error loading expenses:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

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
        await updateExpense(
          editingId,
          expenseData
        );

        alert("Expense updated successfully!");
      } else {
        await addExpense(expenseData);

        alert("Expense added successfully!");
      }

      resetForm();

      await loadExpenses();
    } catch (error) {
      console.error(
        "Error saving expense:",
        error
      );

      alert(error.message);
    }
  };

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
      console.error(
        "Error deleting expense:",
        error
      );

      alert(error.message);
    }
  };

  const totalSpent = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  if (authLoading) {
    return (
      <div className="expense-status-page">
        <div className="expense-status-card">
          <div className="loading-spinner"></div>
          <p>Checking login...</p>
        </div>

        <style>{`
          .expense-status-page {
            min-height: 100vh;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .expense-status-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 30px;
            text-align: center;
            color: #64748b;
          }

          .loading-spinner {
            width: 30px;
            height: 30px;
            margin: 0 auto 12px;
            border: 3px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="expense-status-page">
        <div className="expense-status-card">
          <h2>Please login first.</h2>
        </div>

        <style>{`
          .expense-status-page {
            min-height: 100vh;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .expense-status-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 30px;
            color: #111827;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="expenses-page">
      <Navbar />

      <div className="expenses-layout">
        <Sidebar />

        <main className="expenses-main">
          {/* Header */}
          <div className="expenses-header">
            <div>
              <h1>Expenses</h1>

              <p>
                Add, manage and review all your
                expenses in one place.
              </p>
            </div>

            <div className="total-spending-card">
              <span>Total recorded</span>

              <strong>
                ₹{totalSpent.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Main Grid */}
          <div className="expenses-grid">
            {/* Form */}
            <section className="expense-form-card">
              <div className="section-heading">
                <div>
                  <h2>
                    {editingId
                      ? "Edit Expense"
                      : "Add Expense"}
                  </h2>

                  <p>
                    Enter your expense details below.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Amount */}
                <div className="form-group">
                  <label>Amount</label>

                  <div className="amount-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="amount"
                      placeholder="0"
                      value={form.amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Category + Payment */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>

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
                      <option>
                        Entertainment
                      </option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment</label>

                    <select
                      name="payment"
                      value={form.payment}
                      onChange={handleChange}
                    >
                      <option>UPI</option>
                      <option>Cash</option>
                      <option>
                        Credit Card
                      </option>
                      <option>
                        Debit Card
                      </option>
                    </select>
                  </div>
                </div>

                {/* Date + Time */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>

                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time</label>

                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    placeholder="Add a note..."
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                {/* Buttons */}
                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {editingId
                      ? "Update Expense"
                      : "Add Expense"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Expense List */}
            <section className="expense-list-card">
              <div className="section-heading list-heading">
                <div>
                  <h2>All Expenses</h2>

                  <p>
                    {expenses.length} transaction
                    {expenses.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <span className="count-badge">
                  {expenses.length}
                </span>
              </div>

              {loading ? (
                <div className="empty-state">
                  <div className="loading-spinner"></div>

                  <p>Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    ₹
                  </div>

                  <h3>No expenses yet</h3>

                  <p>
                    Add your first expense using
                    the form.
                  </p>
                </div>
              ) : (
                <div className="expense-list">
                  {expenses.map((expense) => (
                    <div
                      className="expense-item"
                      key={expense._id}
                    >
                      <div className="expense-item-left">
                        <div className="category-icon">
                          {expense.category
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="expense-info">
                          <h3>
                            {expense.category}
                          </h3>

                          <p>
                            {expense.date
                              ? expense.date.substring(
                                  0,
                                  10
                                )
                              : "No date"}{" "}
                            · {expense.time || "No time"}
                          </p>

                          <span>
                            {expense.payment}
                          </span>

                          {expense.notes && (
                            <small>
                              {expense.notes}
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="expense-item-right">
                        <strong>
                          ₹
                          {Number(
                            expense.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <div className="item-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(expense)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                expense._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <style>{`
        .expenses-page {
          min-height: 100vh;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .expenses-layout {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .expenses-main {
          flex: 1;
          min-width: 0;
        }

        .expenses-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .expenses-header h1 {
          margin: 0;
          color: #111827;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .expenses-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .total-spending-card {
          min-width: 180px;
          padding: 16px 18px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .total-spending-card span {
          display: block;
          margin-bottom: 5px;
          color: #64748b;
          font-size: 12px;
        }

        .total-spending-card strong {
          color: #111827;
          font-size: 21px;
        }

        .expenses-grid {
          display: grid;
          grid-template-columns:
            minmax(320px, 0.85fr)
            minmax(0, 1.4fr);
          gap: 20px;
          align-items: start;
        }

        .expense-form-card,
        .expense-list-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 24px;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.04);
        }

        .section-heading {
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0;
          color: #111827;
          font-size: 18px;
          font-weight: 700;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .form-group {
          margin-bottom: 17px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #dbe1e8;
          border-radius: 9px;
          background: #ffffff;
          color: #111827;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 85px;
        }

        .amount-input {
          display: flex;
          align-items: center;
          border: 1px solid #dbe1e8;
          border-radius: 9px;
          overflow: hidden;
          background: #ffffff;
        }

        .amount-input span {
          padding-left: 13px;
          color: #64748b;
          font-size: 16px;
          font-weight: 600;
        }

        .amount-input input {
          border: 0;
          border-radius: 0;
          box-shadow: none !important;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .primary-button,
        .secondary-button {
          border: 0;
          border-radius: 9px;
          padding: 11px 16px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.15s,
            opacity 0.15s;
        }

        .primary-button {
          flex: 1;
          background: #2563eb;
          color: #ffffff;
        }

        .primary-button:hover {
          opacity: 0.92;
        }

        .secondary-button {
          background: #f1f5f9;
          color: #374151;
        }

        .primary-button:active,
        .secondary-button:active {
          transform: scale(0.98);
        }

        .list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 28px;
          padding: 0 9px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
        }

        .expense-list {
          display: flex;
          flex-direction: column;
        }

        .expense-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 16px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .expense-item:first-child {
          padding-top: 0;
        }

        .expense-item:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .expense-item-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }

        .category-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          font-size: 15px;
          font-weight: 700;
        }

        .expense-info {
          min-width: 0;
        }

        .expense-info h3 {
          margin: 0;
          color: #111827;
          font-size: 14px;
          font-weight: 700;
        }

        .expense-info p {
          margin: 4px 0;
          color: #64748b;
          font-size: 12px;
        }

        .expense-info span {
          display: inline-block;
          padding: 3px 7px;
          border-radius: 5px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
        }

        .expense-info small {
          display: block;
          margin-top: 5px;
          color: #6b7280;
          font-size: 11px;
          word-break: break-word;
        }

        .expense-item-right {
          flex-shrink: 0;
          text-align: right;
        }

        .expense-item-right > strong {
          display: block;
          margin-bottom: 8px;
          color: #111827;
          font-size: 15px;
        }

        .item-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .item-actions button {
          border: 0;
          background: transparent;
          color: #2563eb;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 3px;
        }

        .item-actions .delete-button {
          color: #dc2626;
        }

        .empty-state {
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-state h3 {
          margin: 12px 0 5px;
          color: #374151;
          font-size: 16px;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 700;
        }

        .loading-spinner {
          width: 28px;
          height: 28px;
          margin: 0 auto 12px;
          border: 3px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: expense-spin 0.8s linear infinite;
        }

        @keyframes expense-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .expenses-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .expenses-layout {
            padding: 20px;
          }
        }

        @media (max-width: 768px) {
          .expenses-layout {
            display: block;
            padding: 16px;
          }

          .expenses-header {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 18px;
          }

          .expenses-header h1 {
            font-size: 25px;
          }

          .total-spending-card {
            width: 100%;
          }

          .expenses-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .expense-form-card,
          .expense-list-card {
            padding: 18px;
          }
        }

        @media (max-width: 520px) {
          .expenses-layout {
            padding: 12px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .expense-item {
            align-items: flex-start;
          }

          .expense-item-right {
            text-align: right;
          }

          .item-actions {
            flex-direction: column;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default Expenses;