import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <h3>Menu</h3>

      <div>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div>
        <Link to="/expenses">Expenses</Link>
      </div>

      <div>
        <Link to="/calendar">Calendar</Link>
      </div>

      <div>
        <Link to="/reports">Reports</Link>
      </div>

      <div>
        <Link to="/profile">Profile</Link>
      </div>
    </aside>
  );
}

export default Sidebar;