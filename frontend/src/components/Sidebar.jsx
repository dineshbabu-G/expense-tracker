import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px 14px",
        boxSizing: "border-box",
        height: "fit-content",
        position: "sticky",
        top: "90px",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: "0 10px 16px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "700",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Menu
        </h3>
      </div>

      {/* Dashboard */}
      <div style={menuItemStyle}>
        <Link
          to="/dashboard"
          style={linkStyle}
        >
          <span>▦</span>
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Expenses */}
      <div style={menuItemStyle}>
        <Link
          to="/expenses"
          style={linkStyle}
        >
          <span>₹</span>
          <span>Expenses</span>
        </Link>
      </div>

      {/* Calendar */}
      <div style={menuItemStyle}>
        <Link
          to="/calendar"
          style={linkStyle}
        >
          <span>▣</span>
          <span>Calendar</span>
        </Link>
      </div>

      {/* Reports */}
      <div style={menuItemStyle}>
        <Link
          to="/reports"
          style={linkStyle}
        >
          <span>▤</span>
          <span>Reports</span>
        </Link>
      </div>

      {/* Profile */}
      <div style={menuItemStyle}>
        <Link
          to="/profile"
          style={linkStyle}
        >
          <span>◯</span>
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
}

const menuItemStyle = {
  marginBottom: "5px",
};

const linkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  textDecoration: "none",
  color: "#4b5563",
  fontSize: "14px",
  fontWeight: "500",
  padding: "11px 10px",
  borderRadius: "8px",
};

export default Sidebar;