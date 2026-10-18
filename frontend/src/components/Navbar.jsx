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
    <nav>
      <h2>Expense Tracker</h2>

      <div>
        <Link to="/dashboard">Dashboard</Link>{" "}
        <Link to="/expenses">Expenses</Link>{" "}
        <Link to="/calendar">Calendar</Link>{" "}
        <Link to="/reports">Reports</Link>{" "}
        <Link to="/profile">Profile</Link>{" "}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;