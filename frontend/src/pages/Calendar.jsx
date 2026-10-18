import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getExpenses, deleteExpense } from "../services/api";

function Calendar() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [selectedDate, setSelectedDate] =
    useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  /* =========================
     LOAD EXPENSES
  ========================= */

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user?.uid) {
        setExpenses([]);
        return;
      }

      const data = await getExpenses(user.uid);

      setExpenses(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Calendar loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load expenses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  /* =========================
     DATE HELPERS
  ========================= */

  const getExpenseDate = (expense) => {
    if (!expense?.date) return null;

    const date = new Date(expense.date);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  /* =========================
     CURRENT MONTH EXPENSES
  ========================= */

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const date = getExpenseDate(expense);

      if (!date) return false;

      return (
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    });
  }, [expenses, year, month]);

  /* =========================
     CALENDAR DATA
  ========================= */

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  /* =========================
     DAY EXPENSES
  ========================= */

  const getDayExpenses = (day) => {
    return monthlyExpenses.filter((expense) => {
      const date = getExpenseDate(expense);

      return (
        date &&
        date.getDate() === day
      );
    });
  };

  const getDayTotal = (day) => {
    return getDayExpenses(day).reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );
  };

  /* =========================
     SELECTED DATE
  ========================= */

  const selectedExpenses = useMemo(() => {
    if (!selectedDate) return [];

    return getDayExpenses(selectedDate);
  }, [
    selectedDate,
    monthlyExpenses,
  ]);

  const selectedTotal =
    selectedExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  /* =========================
     MONTH TOTAL
  ========================= */

  const monthTotal =
    monthlyExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  /* =========================
     NAVIGATION
  ========================= */

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );

    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );

    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(
      today.getDate()
    );
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this expense?"
    );

    if (!confirmed) return;

    try {
      await deleteExpense(id);

      await loadExpenses();
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      alert(
        err.message ||
          "Failed to delete expense."
      );
    }
  };

  /* =========================
     TODAY CHECK
  ========================= */

  const today = new Date();

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="calendar-page">

      <Navbar />

      <div className="calendar-layout">

        <Sidebar />

        <main className="calendar-main">

          {/* =========================
              PAGE HEADER
          ========================= */}

          <div className="page-header">

            <div>
              <div className="page-title-row">

                <div className="calendar-title-icon">
                  📅
                </div>

                <div>
                  <h1>Calendar</h1>

                  <p>
                    View your spending by date
                    and manage daily expenses.
                  </p>
                </div>

              </div>
            </div>

            <button
              className="today-btn"
              onClick={goToToday}
            >
              <span>Today</span>
            </button>

          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="error-box">
              <span>!</span>
              {error}
            </div>
          )}

          {/* =========================
              SUMMARY CARDS
          ========================= */}

          <div className="summary-grid">

            <div className="summary-card">

              <div className="summary-icon blue">
                ₹
              </div>

              <div>
                <span>
                  This month
                </span>

                <strong>
                  ₹
                  {monthTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

            </div>

            <div className="summary-card">

              <div className="summary-icon green">
                #
              </div>

              <div>
                <span>
                  Transactions
                </span>

                <strong>
                  {monthlyExpenses.length}
                </strong>
              </div>

            </div>

            <div className="summary-card">

              <div className="summary-icon orange">
                ₹
              </div>

              <div>
                <span>
                  Selected day
                </span>

                <strong>
                  ₹
                  {selectedTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

            </div>

          </div>

          {/* =========================
              CALENDAR CARD
          ========================= */}

          <section className="calendar-card">

            {/* CALENDAR HEADER */}

            <div className="calendar-header">

              <button
                className="nav-month-btn"
                onClick={previousMonth}
              >
                ‹
              </button>

              <div className="month-heading">
                <h2>
                  {monthName}
                </h2>

                <span>
                  {year}
                </span>
              </div>

              <button
                className="nav-month-btn"
                onClick={nextMonth}
              >
                ›
              </button>

            </div>

            {/* WEEKDAYS */}

            <div className="weekdays">

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
                  className="weekday"
                >
                  {day}
                </div>
              ))}

            </div>

            {/* CALENDAR */}

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Loading expenses...
              </div>
            ) : (
              <div className="calendar-grid">

                {/* EMPTY DAYS */}

                {Array.from({
                  length: firstDay,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day empty"
                  />
                ))}

                {/* MONTH DAYS */}

                {Array.from({
                  length: daysInMonth,
                }).map((_, index) => {

                  const day = index + 1;

                  const dayExpenses =
                    getDayExpenses(day);

                  const total =
                    getDayTotal(day);

                  const selected =
                    selectedDate === day;

                  return (
                    <button
                      key={day}
                      className={`
                        calendar-day
                        ${selected ? "selected" : ""}
                        ${isToday(day) ? "today" : ""}
                        ${
                          dayExpenses.length > 0
                            ? "has-expense"
                            : ""
                        }
                      `}
                      onClick={() =>
                        setSelectedDate(day)
                      }
                    >

                      <div className="day-top">

                        <span className="day-number">
                          {day}
                        </span>

                        {isToday(day) && (
                          <span className="today-dot">
                            Today
                          </span>
                        )}

                      </div>

                      {dayExpenses.length >
                        0 && (
                        <div className="day-spending">

                          <span>
                            {dayExpenses.length}{" "}
                            {dayExpenses.length ===
                            1
                              ? "transaction"
                              : "transactions"}
                          </span>

                          <strong>
                            ₹
                            {total.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>
                      )}

                    </button>
                  );
                })}

              </div>
            )}

            {/* LEGEND */}

            <div className="calendar-legend">

              <div>
                <span className="legend-dot blue-dot"></span>
                Selected date
              </div>

              <div>
                <span className="legend-dot green-dot"></span>
                Today
              </div>

              <div>
                <span className="legend-dot orange-dot"></span>
                Has expenses
              </div>

            </div>

          </section>

          {/* =========================
              SELECTED DATE DETAILS
          ========================= */}

          <section className="details-card">

            <div className="details-header">

              <div>
                <span className="details-label">
                  SELECTED DATE
                </span>

                <h2>
                  {selectedDate
                    ? `${selectedDate} ${monthName} ${year}`
                    : "Select a date"}
                </h2>
              </div>

              {selectedDate && (
                <div className="details-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {selectedTotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              )}

            </div>

            {!selectedDate ? (
              <div className="empty-details">
                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  Select a date
                </h3>

                <p>
                  Click any date on the calendar
                  to view its expenses.
                </p>
              </div>
            ) : selectedExpenses.length ===
              0 ? (
              <div className="empty-details">
                <div className="empty-icon">
                  ✓
                </div>

                <h3>
                  No expenses
                </h3>

                <p>
                  No expenses were recorded
                  on this date.
                </p>
              </div>
            ) : (
              <div className="expense-list">

                {selectedExpenses.map(
                  (expense) => (
                    <div
                      className="expense-row"
                      key={expense._id}
                    >

                      <div className="expense-info">

                        <div className="expense-icon">
                          {String(
                            expense.category ||
                              "Other"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3>
                            {expense.category ||
                              "Other"}
                          </h3>

                          <p>
                            {expense.payment ||
                              "Payment"}

                            {expense.notes &&
                              ` • ${expense.notes}`}
                          </p>

                        </div>

                      </div>

                      <div className="expense-actions">

                        <strong>
                          ₹
                          {Number(
                            expense.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <button
                          onClick={() =>
                            handleDelete(
                              expense._id
                            )
                          }
                          className="delete-btn"
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </main>
      </div>

      {/* =========================
          DESIGN
      ========================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .calendar-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #111827;
          overflow-x: hidden;
        }

        .calendar-layout {
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .calendar-main {
          flex: 1;
          min-width: 0;
        }

        /* HEADER */

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .calendar-title-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .page-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .today-btn {
          border: 1px solid #dbe3ef;
          background: #ffffff;
          color: #2563eb;
          border-radius: 9px;
          padding: 11px 18px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s;
        }

        .today-btn:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        /* ERROR */

        .error-box {
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fef2f2;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
        }

        /* SUMMARY */

        .summary-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 13px;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.03);
        }

        .summary-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .summary-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .summary-icon.green {
          background: #f0fdf4;
          color: #16a34a;
        }

        .summary-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .summary-card span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .summary-card strong {
          font-size: 18px;
          color: #111827;
        }

        /* CALENDAR */

        .calendar-card,
        .details-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.04);
        }

        .calendar-card {
          padding: 22px;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .nav-month-btn {
          width: 38px;
          height: 38px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: #ffffff;
          font-size: 24px;
          color: #374151;
          cursor: pointer;
        }

        .nav-month-btn:hover {
          background: #f8fafc;
        }

        .month-heading {
          min-width: 190px;
          text-align: center;
        }

        .month-heading h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .month-heading span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 12px;
        }

        /* WEEKDAYS */

        .weekdays {
          display: grid;
          grid-template-columns:
            repeat(7, 1fr);
          margin-bottom: 7px;
        }

        .weekday {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          padding: 8px;
        }

        /* GRID */

        .calendar-grid {
          display: grid;
          grid-template-columns:
            repeat(7, minmax(0, 1fr));
          gap: 7px;
        }

        .calendar-day {
          min-height: 108px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 9px;
          padding: 10px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .calendar-day:hover {
          border-color: #93c5fd;
          background: #f8fbff;
        }

        .calendar-day.selected {
          border: 2px solid #2563eb;
          background: #eff6ff;
        }

        .calendar-day.today {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .calendar-day.today.selected {
          background: #eff6ff;
          border-color: #2563eb;
        }

        .calendar-day.empty {
          border: none;
          background: transparent;
          cursor: default;
        }

        .day-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .day-number {
          color: #374151;
          font-size: 13px;
          font-weight: 600;
        }

        .today-dot {
          color: #16a34a;
          font-size: 9px;
          font-weight: 700;
        }

        .day-spending {
          margin-top: 18px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 7px;
        }

        .calendar-day.selected
          .day-spending {
          background: #ffffff;
        }

        .day-spending span {
          display: block;
          color: #64748b;
          font-size: 9px;
          margin-bottom: 4px;
        }

        .day-spending strong {
          color: #111827;
          font-size: 11px;
        }

        /* LEGEND */

        .calendar-legend {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #eef2f7;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          flex-wrap: wrap;
        }

        .calendar-legend div {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 11px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .blue-dot {
          background: #2563eb;
        }

        .green-dot {
          background: #22c55e;
        }

        .orange-dot {
          background: #f97316;
        }

        /* LOADING */

        .loading {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          color: #64748b;
          font-size: 13px;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #dbeafe;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* DETAILS */

        .details-card {
          margin-top: 20px;
          padding: 22px;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 18px;
          border-bottom: 1px solid #eef2f7;
        }

        .details-label {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .details-header h2 {
          margin: 5px 0 0;
          font-size: 19px;
          font-weight: 700;
        }

        .details-total {
          text-align: right;
        }

        .details-total span {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .details-total strong {
          font-size: 20px;
        }

        /* EXPENSE LIST */

        .expense-list {
          display: flex;
          flex-direction: column;
        }

        .expense-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .expense-row:last-child {
          border-bottom: none;
        }

        .expense-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .expense-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .expense-info h3 {
          margin: 0;
          font-size: 13px;
        }

        .expense-info p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
          max-width: 450px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .expense-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .expense-actions strong {
          font-size: 14px;
          white-space: nowrap;
        }

        .delete-btn {
          border: none;
          background: transparent;
          color: #dc2626;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .delete-btn:hover {
          text-decoration: underline;
        }

        /* EMPTY */

        .empty-details {
          text-align: center;
          padding: 50px 20px 35px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .empty-details h3 {
          margin: 0;
          font-size: 15px;
        }

        .empty-details p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        /* TABLET */

        @media (max-width: 1000px) {

          .calendar-layout {
            padding: 20px;
          }

          .summary-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .summary-card:last-child {
            grid-column: span 2;
          }

          .calendar-day {
            min-height: 90px;
          }
        }

        /* MOBILE */

        @media (max-width: 768px) {

          .calendar-layout {
            display: block;
            padding: 16px;
          }

          .page-header {
            margin-bottom: 18px;
          }

          .page-header h1 {
            font-size: 25px;
          }

          .page-header p {
            font-size: 12px;
          }

          .calendar-title-icon {
            width: 42px;
            height: 42px;
            font-size: 19px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .summary-card:last-child {
            grid-column: auto;
          }

          .calendar-card {
            padding: 14px;
          }

          .calendar-day {
            min-height: 75px;
            padding: 7px;
          }

          .day-spending {
            margin-top: 10px;
            padding: 5px;
          }

          .day-spending span {
            display: none;
          }

          .day-spending strong {
            font-size: 9px;
          }

          .calendar-legend {
            justify-content: flex-start;
          }

          .details-card {
            padding: 16px;
          }
        }

        /* SMALL MOBILE */

        @media (max-width: 480px) {

          .calendar-layout {
            padding: 12px;
          }

          .page-title-row {
            gap: 9px;
          }

          .calendar-title-icon {
            display: none;
          }

          .page-header h1 {
            font-size: 23px;
          }

          .today-btn {
            padding: 8px 11px;
            font-size: 11px;
          }

          .calendar-header {
            gap: 8px;
          }

          .month-heading {
            min-width: 145px;
          }

          .month-heading h2 {
            font-size: 17px;
          }

          .nav-month-btn {
            width: 34px;
            height: 34px;
          }

          .weekday {
            font-size: 9px;
            padding: 5px 2px;
          }

          .calendar-grid {
            gap: 4px;
          }

          .calendar-day {
            min-height: 62px;
            padding: 5px;
            border-radius: 7px;
          }

          .day-number {
            font-size: 10px;
          }

          .today-dot {
            display: none;
          }

          .day-spending {
            margin-top: 7px;
          }

          .day-spending strong {
            font-size: 8px;
          }

          .calendar-legend {
            gap: 10px;
          }

          .calendar-legend div {
            font-size: 9px;
          }

          .details-header {
            align-items: flex-start;
          }

          .details-header h2 {
            font-size: 16px;
          }

          .details-total strong {
            font-size: 16px;
          }

          .expense-row {
            align-items: flex-start;
          }

          .expense-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 5px;
          }

          .expense-info p {
            max-width: 150px;
          }
        }

      `}</style>

    </div>
  );
}

export default Calendar;