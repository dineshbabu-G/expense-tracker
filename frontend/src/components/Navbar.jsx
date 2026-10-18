import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav
      style={{
        height: "70px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        style={{
          textDecoration: "none",
          color: "#111827",
          fontSize: "21px",
          fontWeight: "700",
          letterSpacing: "-0.4px",
        }}
      >
        Expense Tracker
      </Link>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Link
          to="/dashboard"
          style={navLinkStyle}
        >
          Dashboard
        </Link>

        <Link
          to="/expenses"
          style={navLinkStyle}
        >
          Expenses
        </Link>

        <Link
          to="/calendar"
          style={navLinkStyle}
        >
          Calendar
        </Link>

        <Link
          to="/reports"
          style={navLinkStyle}
        >
          Reports
        </Link>

        <Link
          to="/profile"
          style={navLinkStyle}
        >
          Profile
        </Link>

        <button
          onClick={handleLogout}
          style={{
            marginLeft: "8px",
            padding: "9px 16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const navLinkStyle = {
  textDecoration: "none",
  color: "#4b5563",
  fontSize: "14px",
  fontWeight: "500",
  padding: "9px 12px",
  borderRadius: "7px",
};

export default Navbar;