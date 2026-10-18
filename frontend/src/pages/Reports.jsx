import { useEffect, useState } from "react";
import jsPDF from "jspdf";

import { getExpenses } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Reports() {
  const today = new Date();

  const [view, setView] = useState("monthly");

  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`
  );

  const [month, setMonth] = useState(
    today.getMonth()
  );

  const [year, setYear] = useState(
    today.getFullYear()
  );

  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [budget, setBudget] = useState(() => {
    const savedBudget =
      localStorage.getItem("monthlyBudget");

    return savedBudget
      ? Number(savedBudget)
      : 15000;
  });

  const [exporting, setExporting] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const categoryNames = [
    "Food",
    "Travel",
    "Bills",
    "Rent",
    "Shopping",
    "Entertainment",
    "Other",
  ];

  // Load user + expenses
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setExpenses([]);
          setLoading(false);
          return;
        }

        try {
          setUser(currentUser);
          setLoading(true);

          const data = await getExpenses(
            currentUser.uid
          );

          setExpenses(data);
        } catch (error) {
          console.error(
            "Error loading reports:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Load budget
  useEffect(() => {
    const savedBudget =
      localStorage.getItem("monthlyBudget");

    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
  }, []);

  // Get Monday
  const getMonday = (date) => {
    const result = new Date(date);

    const day = result.getDay();

    const difference =
      day === 0 ? 6 : day - 1;

    result.setDate(
      result.getDate() - difference
    );

    result.setHours(0, 0, 0, 0);

    return result;
  };

  // Get Sunday
  const getSunday = (date) => {
    const monday = getMonday(date);

    const sunday = new Date(monday);

    sunday.setDate(
      monday.getDate() + 6
    );

    sunday.setHours(
      23,
      59,
      59,
      999
    );

    return sunday;
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(
    (expense) => {
      const expenseDate = new Date(
        expense.date
      );

      if (view === "daily") {
        const selected = new Date(
          selectedDate
        );

        return (
          expenseDate.getFullYear() ===
            selected.getFullYear() &&
          expenseDate.getMonth() ===
            selected.getMonth() &&
          expenseDate.getDate() ===
            selected.getDate()
        );
      }

      if (view === "weekly") {
        const selected = new Date(
          selectedDate
        );

        const monday =
          getMonday(selected);

        const sunday =
          getSunday(selected);

        return (
          expenseDate >= monday &&
          expenseDate <= sunday
        );
      }

      return (
        expenseDate.getFullYear() ===
          year &&
        expenseDate.getMonth() === month
      );
    }
  );

  // Total
  const totalSpent =
    filteredExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  // Remaining
  const remaining =
    budget - totalSpent;

  // Category totals
  const categoryTotals = {};

  categoryNames.forEach((category) => {
    categoryTotals[category] = 0;
  });

  filteredExpenses.forEach((expense) => {
    if (
      categoryTotals[expense.category] !==
      undefined
    ) {
      categoryTotals[expense.category] +=
        Number(expense.amount || 0);
    }
  });

  // Report title
  const getReportTitle = () => {
    if (view === "daily") {
      return `Daily Report - ${selectedDate}`;
    }

    if (view === "weekly") {
      const selected = new Date(
        selectedDate
      );

      const monday =
        getMonday(selected);

      const sunday =
        getSunday(selected);

      return `Weekly Report - ${monday.toLocaleDateString(
        "en-IN"
      )} to ${sunday.toLocaleDateString(
        "en-IN"
      )}`;
    }

    return `Monthly Report - ${monthNames[month]} ${year}`;
  };

  // Download PDF
  const downloadPDF = () => {
    try {
      setExporting(true);

      const doc = new jsPDF();

      let y = 20;

      doc.setFontSize(18);

      doc.text(
        "Expense Tracker Report",
        20,
        y
      );

      y += 10;

      doc.setFontSize(12);

      doc.text(
        getReportTitle(),
        20,
        y
      );

      y += 12;

      doc.setFontSize(11);

      doc.text(
        `Monthly Budget: Rs. ${budget.toLocaleString()}`,
        20,
        y
      );

      y += 7;

      doc.text(
        `Total Spent: Rs. ${totalSpent.toLocaleString()}`,
        20,
        y
      );

      y += 7;

      doc.text(
        `Remaining: Rs. ${remaining.toLocaleString()}`,
        20,
        y
      );

      y += 7;

      doc.text(
        `Transactions: ${filteredExpenses.length}`,
        20,
        y
      );

      y += 12;

      doc.setFontSize(14);

      doc.text(
        "Category-wise Spending",
        20,
        y
      );

      y += 9;

      doc.setFontSize(10);

      categoryNames.forEach(
        (category) => {
          const amount =
            categoryTotals[category];

          if (amount > 0) {
            doc.text(
              `${category}: Rs. ${amount.toLocaleString()}`,
              20,
              y
            );

            y += 6;
          }
        }
      );

      y += 5;

      doc.setFontSize(14);

      doc.text(
        "Expense Details",
        20,
        y
      );

      y += 10;

      doc.setFontSize(9);

      if (
        filteredExpenses.length === 0
      ) {
        doc.text(
          "No expenses found.",
          20,
          y
        );
      } else {
        filteredExpenses.forEach(
          (expense, index) => {
            const date =
              expense.date
                ? new Date(
                    expense.date
                  ).toLocaleDateString(
                    "en-IN"
                  )
                : "";

            const amount =
              Number(
                expense.amount || 0
              ).toLocaleString();

            const category =
              expense.category || "";

            const time =
              expense.time || "";

            const payment =
              expense.payment || "";

            const notes =
              expense.notes || "";

            const line1 =
              `${index + 1}. ${date} | ${time} | ${category} | Rs. ${amount}`;

            const line2 =
              `Payment: ${payment}${
                notes
                  ? ` | Notes: ${notes}`
                  : ""
              }`;

            if (y > 270) {
              doc.addPage();

              y = 20;

              doc.setFontSize(14);

              doc.text(
                "Expense Details - Continued",
                20,
                y
              );

              y += 10;

              doc.setFontSize(9);
            }

            doc.text(
              line1,
              20,
              y
            );

            y += 5;

            doc.text(
              line2,
              20,
              y
            );

            y += 8;
          }
        );
      }

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= pageCount;
        page++
      ) {
        doc.setPage(page);

        doc.setFontSize(8);

        doc.text(
          `Expense Tracker - Page ${page} of ${pageCount}`,
          20,
          290
        );
      }

      const fileName =
        view === "monthly"
          ? `expense-report-${monthNames[month]}-${year}.pdf`
          : view === "weekly"
          ? `expense-report-weekly-${selectedDate}.pdf`
          : `expense-report-daily-${selectedDate}.pdf`;

      doc.save(fileName);

      alert(
        "PDF downloaded successfully!"
      );
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "Failed to generate PDF."
      );
    } finally {
      setExporting(false);
    }
  };

  // Download CSV
  const downloadCSV = () => {
    try {
      setExporting(true);

      if (
        filteredExpenses.length === 0
      ) {
        alert(
          "No expenses available for CSV export."
        );

        setExporting(false);

        return;
      }

      const headers = [
        "Date",
        "Time",
        "Amount",
        "Category",
        "Payment",
        "Notes",
      ];

      const rows =
        filteredExpenses.map(
          (expense) => [
            expense.date
              ? new Date(
                  expense.date
                ).toLocaleDateString(
                  "en-IN"
                )
              : "",
            expense.time || "",
            Number(expense.amount || 0),
            expense.category || "",
            expense.payment || "",
            expense.notes || "",
          ]
        );

      const csvRows = [
        headers,
        ...rows,
      ];

      const csvContent =
        csvRows
          .map((row) =>
            row
              .map((value) => {
                const text =
                  String(
                    value ?? ""
                  );

                return `"${text.replace(
                  /"/g,
                  '""'
                )}"`;
              })
              .join(",")
          )
          .join("\n");

      const blob = new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const fileName =
        view === "monthly"
          ? `expense-report-${monthNames[month]}-${year}.csv`
          : view === "weekly"
          ? `expense-report-weekly-${selectedDate}.csv`
          : `expense-report-daily-${selectedDate}.csv`;

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      alert(
        "CSV downloaded successfully!"
      );
    } catch (error) {
      console.error(
        "CSV generation error:",
        error
      );

      alert(
        "Failed to generate CSV."
      );
    } finally {
      setExporting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="reports-status">
        <div className="status-card">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>

        <style>{`
          .reports-status {
            min-height: 100vh;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .status-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 30px;
            text-align: center;
            color: #64748b;
          }

          .spinner {
            width: 30px;
            height: 30px;
            margin: 0 auto 12px;
            border: 3px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: reportSpin 0.8s linear infinite;
          }

          @keyframes reportSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Login check
  if (!user) {
    return (
      <div className="reports-status">
        <div className="status-card">
          <h2>Please login first.</h2>
        </div>

        <style>{`
          .reports-status {
            min-height: 100vh;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .status-card {
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
    <div className="reports-page">
      <Navbar />

      <div className="reports-layout">
        <Sidebar />

        <main className="reports-main">

          {/* Header */}
          <div className="reports-header">
            <div>
              <h1>Reports</h1>

              <p>
                Review your spending and
                download detailed reports.
              </p>
            </div>

            <div className="transaction-count">
              <span>Transactions</span>
              <strong>
                {filteredExpenses.length}
              </strong>
            </div>
          </div>

          {/* Report Controls */}
          <section className="report-controls">

            <div className="section-title">
              <div>
                <h2>Report Period</h2>

                <p>
                  Select the period you want
                  to analyze.
                </p>
              </div>
            </div>

            {/* View buttons */}
            <div className="view-tabs">
              <button
                className={
                  view === "daily"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView("daily")
                }
              >
                Daily
              </button>

              <button
                className={
                  view === "weekly"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView("weekly")
                }
              >
                Weekly
              </button>

              <button
                className={
                  view === "monthly"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView("monthly")
                }
              >
                Monthly
              </button>
            </div>

            {/* Daily */}
            {view === "daily" && (
              <div className="selector-box">
                <label>
                  Select Date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {/* Weekly */}
            {view === "weekly" && (
              <div className="selector-box">
                <label>
                  Select Any Date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }
                />

                <p className="period-text">
                  Week:{" "}
                  {getMonday(
                    new Date(selectedDate)
                  ).toLocaleDateString(
                    "en-IN"
                  )}{" "}
                  –{" "}
                  {getSunday(
                    new Date(selectedDate)
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              </div>
            )}

            {/* Monthly */}
            {view === "monthly" && (
              <div className="monthly-selectors">
                <div className="selector-box">
                  <label>Month</label>

                  <select
                    value={month}
                    onChange={(e) =>
                      setMonth(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >
                    {monthNames.map(
                      (
                        monthName,
                        index
                      ) => (
                        <option
                          key={monthName}
                          value={index}
                        >
                          {monthName}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="selector-box">
                  <label>Year</label>

                  <select
                    value={year}
                    onChange={(e) =>
                      setYear(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >
                    <option value="2026">
                      2026
                    </option>

                    <option value="2025">
                      2025
                    </option>

                    <option value="2024">
                      2024
                    </option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Summary */}
          <section className="summary-grid">

            <div className="summary-card">
              <span>Monthly Budget</span>

              <strong>
                ₹{budget.toLocaleString("en-IN")}
              </strong>

              <small>
                Planned budget
              </small>
            </div>

            <div className="summary-card">
              <span>Total Spent</span>

              <strong>
                ₹{totalSpent.toLocaleString("en-IN")}
              </strong>

              <small>
                Current report period
              </small>
            </div>

            <div className="summary-card">
              <span>Remaining</span>

              <strong
                className={
                  remaining < 0
                    ? "danger-text"
                    : "success-text"
                }
              >
                ₹{remaining.toLocaleString("en-IN")}
              </strong>

              <small>
                {remaining < 0
                  ? "Budget exceeded"
                  : "Available balance"}
              </small>
            </div>

          </section>

          {/* Export */}
          <section className="export-card">

            <div>
              <h2>Export Report</h2>

              <p>
                Download the selected report
                for offline use.
              </p>
            </div>

            <div className="export-buttons">
              <button
                className="pdf-button"
                onClick={downloadPDF}
                disabled={exporting}
              >
                {exporting
                  ? "Exporting..."
                  : "Download PDF"}
              </button>

              <button
                className="csv-button"
                onClick={downloadCSV}
                disabled={exporting}
              >
                {exporting
                  ? "Exporting..."
                  : "Download CSV"}
              </button>
            </div>

          </section>

          {/* Category */}
          <section className="report-card">

            <div className="section-title">
              <div>
                <h2>
                  Category-wise Spending
                </h2>

                <p>
                  See where your money is
                  going.
                </p>
              </div>
            </div>

            <div className="category-list">

              {categoryNames.map(
                (category) => {
                  const amount =
                    categoryTotals[
                      category
                    ];

                  const percentage =
                    totalSpent > 0
                      ? (amount /
                          totalSpent) *
                        100
                      : 0;

                  return (
                    <div
                      className="category-row"
                      key={category}
                    >
                      <div className="category-top">
                        <span>
                          {category}
                        </span>

                        <strong>
                          ₹
                          {amount.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                      <small>
                        {percentage.toFixed(1)}%
                      </small>
                    </div>
                  );
                }
              )}

            </div>
          </section>

          {/* Expense Details */}
          <section className="report-card">

            <div className="section-title">
              <div>
                <h2>Expense Details</h2>

                <p>
                  Transactions included in
                  this report.
                </p>
              </div>

              <span className="count-badge">
                {filteredExpenses.length}
              </span>
            </div>

            {filteredExpenses.length ===
            0 ? (
              <div className="empty-report">
                <div className="empty-icon">
                  ₹
                </div>

                <h3>
                  No expenses found
                </h3>

                <p>
                  There are no expenses for
                  this selected period.
                </p>
              </div>
            ) : (
              <div className="report-expenses">

                {filteredExpenses.map(
                  (expense) => (
                    <div
                      className="report-expense"
                      key={expense._id}
                    >

                      <div className="report-expense-left">

                        <div className="category-icon">
                          {expense.category
                            ? expense.category
                                .charAt(0)
                                .toUpperCase()
                            : "E"}
                        </div>

                        <div>
                          <h3>
                            {expense.category}
                          </h3>

                          <p>
                            {expense.date
                              ? new Date(
                                  expense.date
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "No date"}{" "}
                            ·{" "}
                            {expense.time ||
                              "No time"}
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

                      <strong className="expense-amount">
                        ₹
                        {Number(
                          expense.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </main>
      </div>

      <style>{`

        .reports-page {
          min-height: 100vh;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .reports-layout {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .reports-main {
          flex: 1;
          min-width: 0;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .reports-header h1 {
          margin: 0;
          color: #111827;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .reports-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .transaction-count {
          min-width: 120px;
          padding: 14px 18px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .transaction-count span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .transaction-count strong {
          color: #111827;
          font-size: 20px;
        }

        .report-controls,
        .report-card,
        .export-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.04);
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .section-title h2 {
          margin: 0;
          color: #111827;
          font-size: 18px;
          font-weight: 700;
        }

        .section-title p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .view-tabs {
          display: flex;
          gap: 8px;
          padding: 5px;
          width: fit-content;
          margin-bottom: 22px;
          background: #f1f5f9;
          border-radius: 10px;
        }

        .view-tabs button {
          border: 0;
          background: transparent;
          color: #64748b;
          padding: 9px 18px;
          border-radius: 7px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .view-tabs button.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow:
            0 1px 4px
            rgba(15, 23, 42, 0.08);
        }

        .selector-box {
          display: flex;
          flex-direction: column;
          width: 230px;
        }

        .selector-box label {
          margin-bottom: 7px;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
        }

        .selector-box input,
        .selector-box select {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #dbe1e8;
          border-radius: 9px;
          background: #ffffff;
          color: #111827;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .selector-box input:focus,
        .selector-box select:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.1);
        }

        .period-text {
          margin: 9px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .monthly-selectors {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .summary-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.04);
        }

        .summary-card span {
          display: block;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .summary-card strong {
          display: block;
          color: #111827;
          font-size: 24px;
          font-weight: 700;
        }

        .summary-card small {
          display: block;
          margin-top: 7px;
          color: #94a3b8;
          font-size: 11px;
        }

        .success-text {
          color: #16a34a !important;
        }

        .danger-text {
          color: #dc2626 !important;
        }

        .export-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .export-card h2 {
          margin: 0;
          color: #111827;
          font-size: 17px;
        }

        .export-card p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .export-buttons {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .export-buttons button {
          border: 0;
          border-radius: 8px;
          padding: 11px 16px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .pdf-button {
          background: #2563eb;
          color: #ffffff;
        }

        .csv-button {
          background: #eff6ff;
          color: #2563eb;
        }

        .export-buttons button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .category-row {
          width: 100%;
        }

        .category-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .category-top span {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }

        .category-top strong {
          color: #111827;
          font-size: 13px;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: #eef2f7;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #2563eb;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .category-row small {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 11px;
          text-align: right;
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

        .report-expenses {
          display: flex;
          flex-direction: column;
        }

        .report-expense {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 16px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .report-expense:first-child {
          padding-top: 0;
        }

        .report-expense:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .report-expense-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }

        .category-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
        }

        .report-expense-left h3 {
          margin: 0;
          color: #111827;
          font-size: 14px;
        }

        .report-expense-left p {
          margin: 4px 0;
          color: #64748b;
          font-size: 12px;
        }

        .report-expense-left span {
          display: inline-block;
          padding: 3px 7px;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
        }

        .report-expense-left small {
          display: block;
          margin-top: 5px;
          color: #6b7280;
          font-size: 11px;
        }

        .expense-amount {
          flex-shrink: 0;
          color: #111827;
          font-size: 15px;
        }

        .empty-report {
          padding: 45px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 12px;
          font-weight: 700;
        }

        .empty-report h3 {
          margin: 0 0 5px;
          color: #374151;
          font-size: 16px;
        }

        .empty-report p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 1000px) {
          .reports-layout {
            padding: 20px;
          }

          .summary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .reports-layout {
            display: block;
            padding: 16px;
          }

          .reports-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .reports-header h1 {
            font-size: 25px;
          }

          .transaction-count {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .report-controls,
          .report-card,
          .export-card {
            padding: 18px;
            margin-bottom: 16px;
          }

          .export-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .export-buttons {
            width: 100%;
          }

          .export-buttons button {
            flex: 1;
          }

          .selector-box {
            width: 100%;
          }
        }

        @media (max-width: 520px) {
          .reports-layout {
            padding: 12px;
          }

          .view-tabs {
            width: 100%;
          }

          .view-tabs button {
            flex: 1;
            padding: 9px 8px;
          }

          .monthly-selectors {
            flex-direction: column;
          }

          .report-expense {
            align-items: flex-start;
          }

          .expense-amount {
            font-size: 14px;
          }
        }

      `}</style>
    </div>
  );
}

export default Reports;