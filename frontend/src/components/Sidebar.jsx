import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <>
      <aside className="sidebar">

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h3>Menu</h3>
        </div>

        {/* Dashboard */}
        <div className="menu-item">
          <Link to="/dashboard" className="sidebar-link">
            <span>▦</span>
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Expenses */}
        <div className="menu-item">
          <Link to="/expenses" className="sidebar-link">
            <span>₹</span>
            <span>Expenses</span>
          </Link>
        </div>

        {/* Calendar */}
        <div className="menu-item">
          <Link to="/calendar" className="sidebar-link">
            <span>▣</span>
            <span>Calendar</span>
          </Link>
        </div>

        {/* Reports */}
        <div className="menu-item">
          <Link to="/reports" className="sidebar-link">
            <span>▤</span>
            <span>Reports</span>
          </Link>
        </div>

        {/* Profile */}
        <div className="menu-item">
          <Link to="/profile" className="sidebar-link">
            <span>◯</span>
            <span>Profile</span>
          </Link>
        </div>

      </aside>

      <style>{`
        .sidebar {
          width: 220px;
          min-width: 220px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px 14px;
          box-sizing: border-box;
          height: fit-content;
          position: sticky;
          top: 90px;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 0 10px 16px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 12px;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .menu-item {
          margin-bottom: 5px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          box-sizing: border-box;
          text-decoration: none;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          padding: 11px 10px;
          border-radius: 8px;
        }

        .sidebar-link:hover {
          background: #f8fafc;
          color: #2563eb;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar {
            position: static;
            width: 100%;
            min-width: 0;
            margin-bottom: 16px;
            padding: 12px;
          }

          .sidebar-header {
            padding: 0 8px 10px;
            margin-bottom: 8px;
          }

          .sidebar-header h3 {
            font-size: 12px;
          }

          .menu-item {
            margin-bottom: 4px;
          }

          .sidebar-link {
            padding: 10px 8px;
            font-size: 13px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .sidebar {
            padding: 10px;
            margin-bottom: 14px;
          }

          .sidebar-header {
            display: none;
          }

          .sidebar {
            display: flex;
            align-items: center;
            gap: 4px;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .sidebar::-webkit-scrollbar {
            display: none;
          }

          .menu-item {
            flex: 0 0 auto;
            margin: 0;
          }

          .sidebar-link {
            white-space: nowrap;
            padding: 9px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;