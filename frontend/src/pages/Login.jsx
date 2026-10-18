import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    setError("");
    setLoading(true);

    try {
      console.log("Trying Firebase login...");

      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log(
        "LOGIN SUCCESS:",
        result.user.uid
      );

      navigate("/expenses");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(
          error.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-info">
          <div className="brand">
            <div className="brand-icon">₹</div>
            <span>Expense Tracker</span>
          </div>

          <div className="info-content">
            <h1>
              Take control of
              <br />
              your expenses.
            </h1>

            <p>
              Track your spending, manage your
              monthly budget, and make better
              financial decisions.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <span>✓</span>
                Track daily expenses
              </div>

              <div className="feature-item">
                <span>✓</span>
                Monitor your monthly budget
              </div>

              <div className="feature-item">
                <span>✓</span>
                View detailed spending reports
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your account.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="error-message">
                <span>!</span>

                <p>{error}</p>
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* SIGNUP */}
          <div className="signup-section">
            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-container {
          width: 100%;
          max-width: 1000px;
          min-height: 600px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
          box-shadow:
            0 10px 30px
            rgba(15, 23, 42, 0.08);
        }

        /* LEFT SIDE */

        .login-info {
          background: #2563eb;
          color: #ffffff;
          padding: 48px;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 18px;
          font-weight: 700;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .info-content {
          margin-top: auto;
          margin-bottom: auto;
          max-width: 400px;
        }

        .info-content h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.18;
          font-weight: 700;
          letter-spacing: -1px;
        }

        .info-content p {
          margin: 20px 0 28px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 15px;
          line-height: 1.7;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.92);
        }

        .feature-item span {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /* RIGHT SIDE */

        .login-card {
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-header {
          margin-bottom: 30px;
        }

        .login-header h2 {
          margin: 0;
          color: #111827;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .login-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          outline: none;
          color: #111827;
          background: #ffffff;
          font-size: 14px;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .form-group input::placeholder {
          color: #9ca3af;
        }

        .form-group input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.1);
        }

        .error-message {
          margin-bottom: 18px;
          padding: 11px 13px;
          border-radius: 8px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .error-message span {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border-radius: 50%;
          background: #ef4444;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .error-message p {
          margin: 1px 0 0;
          line-height: 1.4;
        }

        .login-button {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.2s,
            transform 0.2s;
        }

        .login-button:hover {
          background: #1d4ed8;
        }

        .login-button:active {
          transform: translateY(1px);
        }

        .login-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
          transform: none;
        }

        .signup-section {
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid #eef2f7;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          color: #64748b;
          font-size: 13px;
        }

        .signup-section a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }

        .signup-section a:hover {
          text-decoration: underline;
        }

        /* TABLET */

        @media (max-width: 800px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 520px;
          }

          .login-info {
            padding: 32px;
            min-height: 260px;
          }

          .info-content {
            margin-top: 45px;
            margin-bottom: 0;
          }

          .info-content h1 {
            font-size: 30px;
          }

          .feature-list {
            display: none;
          }

          .login-card {
            padding: 40px 32px;
          }
        }

        /* MOBILE */

        @media (max-width: 480px) {
          .login-page {
            padding: 12px;
          }

          .login-container {
            border-radius: 14px;
            min-height: auto;
          }

          .login-info {
            padding: 24px;
            min-height: 210px;
          }

          .brand {
            font-size: 16px;
          }

          .brand-icon {
            width: 34px;
            height: 34px;
          }

          .info-content {
            margin-top: 35px;
          }

          .info-content h1 {
            font-size: 26px;
          }

          .info-content p {
            margin: 12px 0 0;
            font-size: 13px;
          }

          .login-card {
            padding: 32px 22px;
          }

          .login-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;