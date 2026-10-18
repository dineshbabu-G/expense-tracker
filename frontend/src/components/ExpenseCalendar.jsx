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

  const selectedExpenses = selectedDate
    ? getDateExpenses(selectedDate)
    : [];

  const selectedTotal =
    selectedExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
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
            Monthly spending calendar
          </p>

          <h2 style={headingStyle}>
            Expense Calendar
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={previousMonth}
            style={navButtonStyle}
          >
            ←
          </button>

          <div
            style={{
              minWidth: "125px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {monthName} {year}
          </div>

          <button
            onClick={nextMonth}
            style={navButtonStyle}
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: "40px 15px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Loading calendar...
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                minWidth: "500px",
              }}
            >
              {/* Week Days */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(7, 1fr)",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
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
                      padding: "8px 0",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748b",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(7, 1fr)",
                  gap: "6px",
                }}
              >
                {days.map((day, index) => {
                  const total =
                    getDateTotal(day);

                  const isSelected =
                    selectedDate === day;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (day) {
                          setSelectedDate(day);
                          setEditingId(null);
                        }
                      }}
                      style={{
                        minHeight: "75px",
                        border:
                          isSelected
                            ? "2px solid #2563eb"
                            : "1px solid #e5e7eb",
                        borderRadius: "9px",
                        padding: "8px",
                        boxSizing:
                          "border-box",
                        cursor: day
                          ? "pointer"
                          : "default",
                        background:
                          isSelected
                            ? "#eff6ff"
                            : total > 0
                            ? "#f8fafc"
                            : "#ffffff",
                        transition:
                          "0.15s ease",
                      }}
                    >
                      {day && (
                        <>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#374151",
                            }}
                          >
                            {day}
                          </div>

                          {total > 0 && (
                            <div
                              style={{
                                marginTop: "9px",
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#2563eb",
                                wordBreak:
                                  "break-word",
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
                })}
              </div>
            </div>
          </div>

          {/* Selected Date */}
          {selectedDate && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                background: "#f8fafc",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "18px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    Selected date
                  </p>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      color: "#111827",
                    }}
                  >
                    {selectedDate}{" "}
                    {monthName} {year}
                  </h3>
                </div>

                <div
                  style={{
                    padding: "9px 12px",
                    background: "#ffffff",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Total: ₹
                  {selectedTotal.toLocaleString()}
                </div>
              </div>

              {selectedExpenses.length ===
              0 ? (
                <div
                  style={{
                    padding: "25px",
                    textAlign: "center",
                    background: "#ffffff",
                    borderRadius: "9px",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  No expenses on this date.
                </div>
              ) : (
                selectedExpenses.map(
                  (expense) => (
                    <div
                      key={expense._id}
                      style={{
                        padding: "16px 0",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      {editingId ===
                      expense._id ? (
                        /* Edit Mode */
                        <div>
                          <h4
                            style={{
                              margin:
                                "0 0 15px",
                              color:
                                "#111827",
                            }}
                          >
                            Edit Expense
                          </h4>

                          <div
                            style={editGridStyle}
                          >
                            <input
                              type="number"
                              name="amount"
                              value={
                                editForm.amount
                              }
                              onChange={
                                handleEditChange
                              }
                              placeholder="Amount"
                              style={
                                inputStyle
                              }
                            />

                            <select
                              name="category"
                              value={
                                editForm.category
                              }
                              onChange={
                                handleEditChange
                              }
                              style={
                                inputStyle
                              }
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

                            <input
                              type="date"
                              name="date"
                              value={
                                editForm.date
                              }
                              onChange={
                                handleEditChange
                              }
                              style={
                                inputStyle
                              }
                            />

                            <input
                              type="time"
                              name="time"
                              value={
                                editForm.time
                              }
                              onChange={
                                handleEditChange
                              }
                              style={
                                inputStyle
                              }
                            />

                            <select
                              name="payment"
                              value={
                                editForm.payment
                              }
                              onChange={
                                handleEditChange
                              }
                              style={
                                inputStyle
                              }
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
                          </div>

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
                              ...inputStyle,
                              width: "100%",
                              marginTop: "12px",
                              resize: "vertical",
                              boxSizing:
                                "border-box",
                            }}
                          />

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "12px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleUpdate(
                                  expense._id
                                )
                              }
                              style={
                                saveButtonStyle
                              }
                            >
                              Save Changes
                            </button>

                            <button
                              onClick={() =>
                                setEditingId(
                                  null
                                )
                              }
                              style={
                                cancelButtonStyle
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                              gap: "15px",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  fontSize:
                                    "14px",
                                  color:
                                    "#111827",
                                }}
                              >
                                {
                                  expense.category
                                }
                              </strong>

                              <p
                                style={
                                  detailTextStyle
                                }
                              >
                                ₹
                                {Number(
                                  expense.amount
                                ).toLocaleString()}
                              </p>

                              <p
                                style={
                                  detailTextStyle
                                }
                              >
                                Time:{" "}
                                {expense.time ||
                                  "Not available"}
                              </p>

                              <p
                                style={
                                  detailTextStyle
                                }
                              >
                                Payment:{" "}
                                {
                                  expense.payment
                                }
                              </p>

                              {expense.notes && (
                                <p
                                  style={
                                    detailTextStyle
                                  }
                                >
                                  Notes:{" "}
                                  {
                                    expense.notes
                                  }
                                </p>
                              )}
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",
                                gap: "7px",
                                flexWrap:
                                  "wrap",
                                justifyContent:
                                  "flex-end",
                              }}
                            >
                              <button
                                onClick={() =>
                                  startEdit(
                                    expense
                                  )
                                }
                                style={
                                  editButtonStyle
                                }
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    expense._id
                                  )
                                }
                                style={
                                  deleteButtonStyle
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
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

const navButtonStyle = {
  width: "34px",
  height: "34px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#374151",
  fontSize: "16px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "10px 11px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "13px",
  boxSizing: "border-box",
};

const editGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
};

const detailTextStyle = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: "12px",
};

const saveButtonStyle = {
  padding: "9px 14px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const cancelButtonStyle = {
  padding: "9px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const editButtonStyle = {
  padding: "7px 11px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const deleteButtonStyle = {
  padding: "7px 11px",
  border: "1px solid #fecaca",
  borderRadius: "7px",
  background: "#fef2f2",
  color: "#dc2626",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

export default ExpenseCalendar;