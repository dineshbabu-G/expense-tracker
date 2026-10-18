import { useEffect, useState } from "react";
import jsPDF from "jspdf";

import { getExpenses } from "../services/api";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

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

  // -----------------------------
  // Load User + Expenses
  // -----------------------------

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

  // -----------------------------
  // Load Budget
  // -----------------------------

  useEffect(() => {
    const savedBudget =
      localStorage.getItem("monthlyBudget");

    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
  }, []);

  // -----------------------------
  // Get Monday
  // -----------------------------

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

  // -----------------------------
  // Get Sunday
  // -----------------------------

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

  // -----------------------------
  // Filter Expenses
  // -----------------------------

  const filteredExpenses = expenses.filter(
    (expense) => {
      const expenseDate = new Date(
        expense.date
      );

      // DAILY
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

      // WEEKLY
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

      // MONTHLY
      return (
        expenseDate.getFullYear() ===
          year &&
        expenseDate.getMonth() ===
          month
      );
    }
  );

  // -----------------------------
  // Total Spent
  // -----------------------------

  const totalSpent =
    filteredExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );

  // -----------------------------
  // Remaining
  // -----------------------------

  const remaining =
    budget - totalSpent;

  // -----------------------------
  // Category Totals
  // -----------------------------

  const categoryTotals = {};

  categoryNames.forEach((category) => {
    categoryTotals[category] = 0;
  });

  filteredExpenses.forEach((expense) => {
    if (
      categoryTotals[
        expense.category
      ] !== undefined
    ) {
      categoryTotals[
        expense.category
      ] += Number(expense.amount);
    }
  });

  // -----------------------------
  // Report Title
  // -----------------------------

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

  // -----------------------------
  // Download PDF
  // -----------------------------

  const downloadPDF = () => {
    try {
      setExporting(true);

      const doc = new jsPDF();

      let y = 20;

      // Title
      doc.setFontSize(18);

      doc.text(
        "Expense Tracker Report",
        20,
        y
      );

      y += 10;

      // Report period
      doc.setFontSize(12);

      doc.text(
        getReportTitle(),
        20,
        y
      );

      y += 12;

      // Summary
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

      // Category section
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

      // Expense section
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
                expense.amount
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

            // New page if required
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

      // Footer
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

  // -----------------------------
  // Download CSV
  // -----------------------------

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
            Number(expense.amount),
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

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "30px",
          background: "#f5f7fa",
        }}
      >
        <h1>Reports</h1>

        <p>
          Loading reports...
        </p>
      </div>
    );
  }

  // -----------------------------
  // Login Check
  // -----------------------------

  if (!user) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        <h1>
          Please login first.
        </h1>
      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          border:
            "1px solid #e5e7eb",
        }}
      >
        <h1>
          Reports
        </h1>

        <p>
          View and download your
          expense reports.
        </p>

        <hr />

        {/* View Type */}
        <h2>
          Report Period
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <button
            onClick={() =>
              setView("daily")
            }
          >
            Daily
          </button>

          <button
            onClick={() =>
              setView("weekly")
            }
          >
            Weekly
          </button>

          <button
            onClick={() =>
              setView("monthly")
            }
          >
            Monthly
          </button>
        </div>

        {/* Daily */}
        {view === "daily" && (
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>
              Select Date
            </label>

            <br />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              style={{
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>
        )}

        {/* Weekly */}
        {view === "weekly" && (
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>
              Select Any Date
            </label>

            <br />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              style={{
                padding: "10px",
                marginTop: "5px",
              }}
            />

            <p>
              Week:
              {" "}
              {getMonday(
                new Date(
                  selectedDate
                )
              ).toLocaleDateString(
                "en-IN"
              )}
              {" "}
              to{" "}
              {getSunday(
                new Date(
                  selectedDate
                )
              ).toLocaleDateString(
                "en-IN"
              )}
            </p>
          </div>
        )}

        {/* Monthly */}
        {view === "monthly" && (
          <>
            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label>
                Month
              </label>

              <br />

              <select
                value={month}
                onChange={(e) =>
                  setMonth(
                    Number(
                      e.target.value
                    )
                  )
                }
                style={{
                  padding: "10px",
                  marginTop: "5px",
                  width: "200px",
                }}
              >
                {monthNames.map(
                  (
                    monthName,
                    index
                  ) => (
                    <option
                      key={
                        monthName
                      }
                      value={index}
                    >
                      {monthName}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label>
                Year
              </label>

              <br />

              <select
                value={year}
                onChange={(e) =>
                  setYear(
                    Number(
                      e.target.value
                    )
                  )
                }
                style={{
                  padding: "10px",
                  marginTop: "5px",
                  width: "200px",
                }}
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
          </>
        )}

        {/* Export Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <button
            onClick={downloadPDF}
            disabled={exporting}
            style={{
              padding: "12px 20px",
              cursor: exporting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {exporting
              ? "Exporting..."
              : "Download PDF"}
          </button>

          <button
            onClick={downloadCSV}
            disabled={exporting}
            style={{
              padding: "12px 20px",
              cursor: exporting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {exporting
              ? "Exporting..."
              : "Download CSV"}
          </button>
        </div>

        {/* Summary */}
        <div
          style={{
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "10px",
            border:
              "1px solid #e5e7eb",
            marginBottom: "20px",
          }}
        >
          <h2>
            {getReportTitle()}
          </h2>

          <p>
            Monthly Budget:
            {" "}
            <strong>
              ₹
              {budget.toLocaleString()}
            </strong>
          </p>

          <p>
            Total Spent:
            {" "}
            <strong>
              ₹
              {totalSpent.toLocaleString()}
            </strong>
          </p>

          <p>
            Remaining:
            {" "}
            <strong
              style={{
                color:
                  remaining < 0
                    ? "#dc2626"
                    : "#16a34a",
              }}
            >
              ₹
              {remaining.toLocaleString()}
            </strong>
          </p>

          <p>
            Transactions:
            {" "}
            <strong>
              {filteredExpenses.length}
            </strong>
          </p>

          {remaining < 0 && (
            <p
              style={{
                color: "#dc2626",
                fontWeight: "bold",
              }}
            >
              Budget exceeded!
            </p>
          )}
        </div>

        {/* Category Report */}
        <div
          style={{
            padding: "20px",
            background: "#ffffff",
            borderRadius: "10px",
            border:
              "1px solid #e5e7eb",
            marginBottom: "20px",
          }}
        >
          <h2>
            Category-wise Spending
          </h2>

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
                  key={category}
                  style={{
                    marginBottom:
                      "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom:
                        "5px",
                    }}
                  >
                    <span>
                      {category}
                    </span>

                    <strong>
                      ₹
                      {amount.toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "10px",
                      background:
                        "#e5e7eb",
                      borderRadius:
                        "10px",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background:
                          "#2563eb",
                        borderRadius:
                          "10px",
                      }}
                    ></div>
                  </div>

                  <small>
                    {percentage.toFixed(
                      1
                    )}
                    %
                  </small>
                </div>
              );
            }
          )}
        </div>

        {/* Expense List */}
        <div
          style={{
            padding: "20px",
            background: "#ffffff",
            borderRadius: "10px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <h2>
            Expenses
          </h2>

          {filteredExpenses.length ===
          0 ? (
            <p>
              No expenses found for
              this period.
            </p>
          ) : (
            filteredExpenses.map(
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

                  <p
                    style={{
                      color:
                        "#6b7280",
                    }}
                  >
                    Date:{" "}
                    {expense.date
                      ? new Date(
                          expense.date
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "No date"}
                  </p>

                  <p
                    style={{
                      color:
                        "#6b7280",
                    }}
                  >
                    Time:{" "}
                    {expense.time ||
                      "Not available"}
                  </p>

                  <p
                    style={{
                      color:
                        "#6b7280",
                    }}
                  >
                    Payment:{" "}
                    {
                      expense.payment
                    }
                  </p>

                  {expense.notes && (
                    <p
                      style={{
                        color:
                          "#6b7280",
                      }}
                    >
                      Notes:{" "}
                      {
                        expense.notes
                      }
                    </p>
                  )}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;