import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Profile() {
  const [user, setUser] = useState(null);

  const [budget, setBudget] = useState(() => {
    const savedBudget =
      localStorage.getItem("monthlyBudget");

    return savedBudget || "15000";
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();

    const budgetNumber = Number(budget);

    if (budgetNumber <= 0) {
      alert("Please enter a valid budget.");
      return;
    }

    localStorage.setItem(
      "monthlyBudget",
      budgetNumber
    );

    setBudget(String(budgetNumber));
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

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
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1>Profile</h1>

        <p>
          Manage your profile and monthly budget.
        </p>

        <hr />

        <h2>Account Details</h2>

        {user ? (
          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <p>
              <strong>Email:</strong>{" "}
              {user.email}
            </p>

            <p>
              <strong>User ID:</strong>{" "}
              {user.uid}
            </p>
          </div>
        ) : (
          <p>Checking login...</p>
        )}

        <hr />

        <h2>Monthly Budget</h2>

        <p>
          Set the amount you want to spend
          each month.
        </p>

        <form onSubmit={handleSave}>
          <label>
            Monthly Budget
          </label>

          <br />

          <input
            type="number"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value)
            }
            min="1"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "15px",
              boxSizing: "border-box",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Save Budget
          </button>
        </form>

        {saved && (
          <p
            style={{
              color: "green",
              marginTop: "15px",
            }}
          >
            Monthly budget saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;