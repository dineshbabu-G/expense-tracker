import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BudgetCard from "../components/BudgetCard";
import CategoryChart from "../components/CategoryChart";
import SpendingChart from "../components/SpendingChart";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseCalendar from "../components/ExpenseCalendar";

function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshKey((previousKey) => previousKey + 1);
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">

          {/* Header */}
          <section className="dashboard-header">
            <div>
              <h1>Dashboard</h1>
              <p>
                Track your spending and stay on top of
                your monthly budget.
              </p>
            </div>
          </section>

          {/* Monthly Budget */}
          <section className="dashboard-section budget-section">
            <BudgetCard key={`budget-${refreshKey}`} />
          </section>

          {/* Charts */}
          <section className="dashboard-chart-grid">
            <div className="dashboard-section">
              <CategoryChart
                key={`category-${refreshKey}`}
              />
            </div>

            <div className="dashboard-section">
              <SpendingChart
                key={`spending-${refreshKey}`}
              />
            </div>
          </section>

          {/* Expenses + Add Expense */}
          <section className="dashboard-content-grid">

            <div className="dashboard-section">
              <ExpenseList
                key={`expenses-${refreshKey}`}
              />
            </div>

            <div className="dashboard-section">
              <ExpenseForm
                onExpenseAdded={handleExpenseAdded}
              />
            </div>

          </section>

          {/* Calendar */}
          <section className="dashboard-section calendar-section">
            <ExpenseCalendar
              key={`calendar-${refreshKey}`}
              onExpenseChanged={handleExpenseAdded}
            />
          </section>

        </main>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          width: 100%;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .dashboard-layout {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }

        .dashboard-main {
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        /* Header */

        .dashboard-header {
          width: 100%;
          margin-bottom: 24px;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #111827;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .dashboard-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Common section */

        .dashboard-section {
          width: 100%;
          min-width: 0;
          margin: 0;
          padding: 0;
        }

        .budget-section {
          margin-bottom: 20px;
        }

        .calendar-section {
          margin-top: 0;
        }

        /* Charts */

        .dashboard-chart-grid {
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .dashboard-chart-grid > * {
          min-width: 0;
          width: 100%;
        }

        /* Expense list + form */

        .dashboard-content-grid {
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(300px, 1fr);
          gap: 20px;
          margin-bottom: 20px;
          align-items: start;
        }

        .dashboard-content-grid > * {
          min-width: 0;
          width: 100%;
        }

        /* Tablet */

        @media (max-width: 1000px) {

          .dashboard-layout {
            padding: 20px;
            gap: 18px;
          }

          .dashboard-chart-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .dashboard-content-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

        }

        /* Mobile */

        @media (max-width: 768px) {

          .dashboard-layout {
            display: block;
            width: 100%;
            padding: 16px;
          }

          .dashboard-main {
            display: block;
            width: 100%;
            min-width: 0;
          }

          .dashboard-header {
            width: 100%;
            margin-bottom: 18px;
          }

          .dashboard-header h1 {
            font-size: 25px;
          }

          .dashboard-header p {
            font-size: 13px;
            margin-top: 6px;
          }

          .dashboard-section {
            display: block;
            width: 100%;
            min-width: 0;
            margin-left: 0;
            margin-right: 0;
          }

          /* Budget */

          .budget-section {
            margin-bottom: 16px;
          }

          /* Charts */

          .dashboard-chart-grid {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 16px;
            margin-bottom: 16px;
          }

          .dashboard-chart-grid > * {
            width: 100%;
            min-width: 0;
            flex: none;
          }

          /* Expenses */

          .dashboard-content-grid {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 16px;
            margin-bottom: 16px;
          }

          .dashboard-content-grid > * {
            width: 100%;
            min-width: 0;
            flex: none;
          }

          /* Calendar */

          .calendar-section {
            width: 100%;
            margin-top: 0;
          }

        }

        /* Small mobile */

        @media (max-width: 480px) {

          .dashboard-layout {
            padding: 12px;
          }

          .dashboard-header {
            margin-bottom: 16px;
          }

          .dashboard-header h1 {
            font-size: 23px;
          }

          .dashboard-header p {
            font-size: 12px;
            line-height: 1.5;
          }

          .dashboard-chart-grid {
            gap: 14px;
            margin-bottom: 14px;
          }

          .dashboard-content-grid {
            gap: 14px;
            margin-bottom: 14px;
          }

        }
      `}</style>
    </div>
  );
}

export default Dashboard;