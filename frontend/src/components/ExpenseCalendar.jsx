import { useEffect, useState } from "react";
import {
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function ExpenseCalendar({ onExpenseChanged }) {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [editingId, setEditingId] =
    useState(null);

  const [editForm, setEditForm] = useState({
    amount: "",
    category: "Food",
    date: "",
    time: "",
    payment: "UPI",
    notes: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  // Load expenses
  const loadExpenses = async (user) => {
    if (!user) return;

    try {
      setLoading(true);

      const data = await getExpenses(user.uid);

      setExpenses(data);
    } catch (error) {
      console.error(
        "Error loading calendar expenses:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Firebase user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setExpenses([]);
          setLoading(false);
          return;
        }

        await loadExpenses(user);
      }
    );

    return () => unsubscribe();
  }, []);

  // Previous month
  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );

    setSelectedDate(null);
    setEditingId(null);
  };

  // Next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );

    setSelectedDate(null);
    setEditingId(null);
  };

  // Get expenses for selected date
  const getDateExpenses = (day) => {
    if (!day) {
      return [];
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(
        expense.date
      );

      return (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() === month &&
        expenseDate.getDate() === day
      );
    });
  };

  // Get daily total
  const getDateTotal = (day) => {
    const dateExpenses =
      getDateExpenses(day);

    return dateExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );
  };

  // Start editing
  const startEdit = (expense) => {
    setEditingId(expense._id);

    setEditForm({
      amount: expense.amount,
      category: expense.category,
      date: expense.date
        ? expense.date.substring(0, 10)
        : "",
      time: expense.time || "",
      payment: expense.payment,
      notes: expense.notes || "",
    });
  };

  // Edit form change
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // Update expense
  const handleUpdate = async (expenseId) => {
    try {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        alert("Please login first.");
        return;
      }

      const updatedExpense = {
        userId: currentUser.uid,
        amount: Number(editForm.amount),
        category: editForm.category,
        date: editForm.date,
        time: editForm.time,
        payment: editForm.payment,
        notes: editForm.notes,
      };

      await updateExpense(
        expenseId,
        updatedExpense
      );

      alert(
        "Expense updated successfully!"
      );

      setEditingId(null);

      await loadExpenses(currentUser);

      // Refresh Dashboard
      if (onExpenseChanged) {
        onExpenseChanged();
      }
    } catch (error) {
      console.error(
        "Error updating expense:",
        error
      );

      alert(error.message);
    }
  };

  // Delete expense
  const handleDelete = async (expenseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        alert("Please login first.");
        return;
      }

      await deleteExpense(expenseId);

      alert(
        "Expense deleted successfully!"
      );

      setEditingId(null);

      await loadExpenses(currentUser);

      // Refresh Dashboard
      if (onExpenseChanged) {
        onExpenseChanged();
      }
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error
      );

      alert(error.message);
    }
  };

  // Create calendar days
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(day);
  }

  // Selected date expenses
  const selectedExpenses = selectedDate
    ? getDateExpenses(selectedDate)
    : [];

  // Selected date total
  const selectedTotal =
    selectedExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );

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
      {/* Calendar Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <button onClick={previousMonth}>
          Previous
        </button>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
          }}
        >
          {monthName} {year}
        </h2>

        <button onClick={nextMonth}>
          Next
        </button>
      </div>

      {loading ? (
        <p>Loading calendar...</p>
      ) : (
        <>
          {/* Calendar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(7, 1fr)",
              gap: "5px",
            }}
          >
            {/* Week Days */}
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "10px 0",
                }}
              >
                {day}
              </div>
            ))}

            {/* Calendar Dates */}
            {days.map(
              (day, index) => {
                const total =
                  getDateTotal(day);

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (day) {
                        setSelectedDate(
                          day
                        );

                        setEditingId(
                          null
                        );
                      }
                    }}
                    style={{
                      minHeight: "70px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "8px",
                      textAlign: "center",
                      cursor: day
                        ? "pointer"
                        : "default",
                      background:
                        selectedDate === day
                          ? "#eff6ff"
                          : total > 0
                          ? "#f0fdf4"
                          : "#ffffff",
                    }}
                  >
                    {day && (
                      <>
                        <div
                          style={{
                            fontWeight:
                              "bold",
                          }}
                        >
                          {day}
                        </div>

                        {total > 0 && (
                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#16a34a",
                            }}
                          >
                            ₹
                            {total.toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "10px",
                border:
                  "1px solid #e5e7eb",
              }}
            >
              <h3>
                {selectedDate}{" "}
                {monthName} {year}
              </h3>

              <h4>
                Daily Total: ₹
                {selectedTotal.toLocaleString()}
              </h4>

              {selectedExpenses.length ===
              0 ? (
                <p>
                  No expenses on this
                  date.
                </p>
              ) : (
                selectedExpenses.map(
                  (expense) => (
                    <div
                      key={expense._id}
                      style={{
                        padding:
                          "15px 0",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      {editingId ===
                      expense._id ? (
                        /* Edit Mode */
                        <>
                          <h4>
                            Edit Expense
                          </h4>

                          {/* Amount */}
                          <input
                            type="number"
                            name="amount"
                            value={
                              editForm.amount
                            }
                            onChange={
                              handleEditChange
                            }
                            style={{
                              width:
                                "100%",
                              padding:
                                "10px",
                              marginBottom:
                                "10px",
                              boxSizing:
                                "border-box",
                            }}
                          />

                          {/* Category */}
                          <select
                            name="category"
                            value={
                              editForm.category
                            }
                            onChange={
                              handleEditChange
                            }
                            style={{
                              width:
                                "100%",
                              padding:
                                "10px",
                              marginBottom:
                                "10px",
                            }}
                          >
                            <option>
                              Food
                            </option>
                            <option>
                              Travel
                            </option>
                            <option>
                              Bills
                            </option>
                            <option>
                              Rent
                            </option>
                            <option>
                              Shopping
                            </option>
                            <option>
                              Entertainment
                            </option>
                            <option>
                              Other
                            </option>
                          </select>

                          {/* Date */}
                          <input
                            type="date"
                            name="date"
                            value={
                              editForm.date
                            }
                            onChange={
                              handleEditChange
                            }
                            style={{
                              width:
                                "100%",
                              padding:
                                "10px",
                              marginBottom:
                                "10px",
                              boxSizing:
                                "border-box",
                            }}
                          />

                          {/* Time */}
                          <input
                            type="time"
                            name="time"
                            value={
                              editForm.time
                            }
                            onChange={
                              handleEditChange
                            }
                            style={{
                              width:
                                "100%",
                              padding:
                                "10px",
                              marginBottom:
                                "10px",
                              boxSizing:
                                "border-box",
                            }}
                          />

                          {/* Payment */}
                          <select
                            name="payment"
                            value={
                              editForm.payment
                            }
                            onChange={
                              handleEditChange
                            }
                            style={{
                              width:
                                "100%",
                              padding:
                                "10px",
                              marginBottom:
                                "10px",
                            }}
                          >
                            <option>
                              UPI
                            </option>
                            <option>
                              Cash
                            </option>
                            <option>
                              Credit Card
                            </option>
                            <option>
                              Debit Card
                            </option>
                          </select>

                          {/* Notes */}
                          <textarea
                            name="notes"
                            value={
                              editForm.notes
                            }
                            onChange={
                              handleEditChange
                            }
                            placeholder="Notes"
                            rows="3"
                            style={{
                              width:
                                "100%",
                              padding:
                                "10px",
                              marginBottom:
                                "10px",
                              boxSizing:
                                "border-box",
                            }}
                          />

                          {/* Save */}
                          <button
                            onClick={() =>
                              handleUpdate(
                                expense._id
                              )
                            }
                          >
                            Save Changes
                          </button>

                          {" "}

                          {/* Cancel */}
                          <button
                            onClick={() =>
                              setEditingId(
                                null
                              )
                            }
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        /* View Mode */
                        <>
                          <strong>
                            {
                              expense.category
                            }
                          </strong>

                          <p>
                            ₹
                            {Number(
                              expense.amount
                            ).toLocaleString()}
                          </p>

                          <p>
                            Time:{" "}
                            {expense.time ||
                              "Not available"}
                          </p>

                          <p>
                            Payment:{" "}
                            {
                              expense.payment
                            }
                          </p>

                          {expense.notes && (
                            <p>
                              Notes:{" "}
                              {
                                expense.notes
                              }
                            </p>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() =>
                              startEdit(
                                expense
                              )
                            }
                          >
                            Edit
                          </button>

                          {" "}

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              handleDelete(
                                expense._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExpenseCalendar;