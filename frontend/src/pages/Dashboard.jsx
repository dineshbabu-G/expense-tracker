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
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Navbar />

      <div
        style={{
          display: "flex",
          gap: "30px",
          padding: "20px 10px",
          background: "#f5f7fa",
          minHeight: "calc(100vh - 70px)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            maxWidth: "1200px",
            boxSizing: "border-box",
          }}
        >
          <h1>Dashboard</h1>

          <p>
            Welcome to your Personal & Family
            Expense Tracker
          </p>

          <BudgetCard
            key={`budget-${refreshKey}`}
          />

          <CategoryChart
            key={`category-${refreshKey}`}
          />

          <SpendingChart
            key={`spending-${refreshKey}`}
          />

          <ExpenseList
            key={`expenses-${refreshKey}`}
          />

          <ExpenseForm
            onExpenseAdded={handleExpenseAdded}
          />

          <ExpenseCalendar
            key={`calendar-${refreshKey}`}
            onExpenseChanged={handleExpenseAdded}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;