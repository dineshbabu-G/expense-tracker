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
          {/* Page Header */}
          <div className="dashboard-header">
            <div>
              <h1>Dashboard</h1>

              <p>
                Track your spending and stay on top of
                your monthly budget.
              </p>
            </div>
          </div>

          {/* Budget */}
          <BudgetCard
            key={`budget-${refreshKey}`}
          />

          {/* Category + Weekly Spending */}
          <div className="dashboard-chart-grid">
            <CategoryChart
              key={`category-${refreshKey}`}
            />

            <SpendingChart
              key={`spending-${refreshKey}`}
            />
          </div>

          {/* Recent Transactions + Add Expense */}
          <div className="dashboard-content-grid">
            <ExpenseList
              key={`expenses-${refreshKey}`}
            />

            <ExpenseForm
              onExpenseAdded={handleExpenseAdded}
            />
          </div>

          {/* Calendar */}
          <ExpenseCalendar
            key={`calendar-${refreshKey}`}
            onExpenseChanged={handleExpenseAdded}
          />
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

        .dashboard-header {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .dashboard-chart-grid {
          width: 100%;
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .dashboard-content-grid {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(300px, 1fr);
          gap: 20px;
          margin-bottom: 20px;
          align-items: start;
        }

        /* Tablet */
        @media (max-width: 1000px) {
          .dashboard-layout {
            padding: 20px;
            gap: 18px;
          }

          .dashboard-chart-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .dashboard-layout {
            display: block;
            padding: 16px;
          }

          .dashboard-main {
            width: 100%;
          }

          .dashboard-header {
            margin-bottom: 18px;
          }

          .dashboard-header h1 {
            font-size: 25px;
          }

          .dashboard-header p {
            font-size: 13px;
            margin-top: 6px;
          }

          .dashboard-chart-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }

          .dashboard-content-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .dashboard-layout {
            padding: 12px;
          }

          .dashboard-header h1 {
            font-size: 23px;
          }

          .dashboard-header p {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;