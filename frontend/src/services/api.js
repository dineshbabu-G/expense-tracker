import { auth } from "./firebase";

const API_URL =
  "https://expense-tracker-1-dsbr.onrender.com/api";

const getAuthHeaders = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const token = await user.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (
  response,
  defaultMessage
) => {
  if (!response.ok) {
    let errorMessage = defaultMessage;

    try {
      const data = await response.json();

      if (data.message) {
        errorMessage = data.message;
      }
    } catch (error) {
      console.error(
        "Error reading server response:",
        error
      );
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// GET EXPENSES
export const getExpenses = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is missing.");
    }

    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/expenses?userId=${userId}`,
      {
        method: "GET",
        headers,
      }
    );

    return await handleResponse(
      response,
      "Failed to fetch expenses"
    );
  } catch (error) {
    console.error(
      "GET expenses error:",
      error
    );

    throw error;
  }
};

// ADD EXPENSE
export const addExpense = async (expense) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/expenses`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(expense),
      }
    );

    return await handleResponse(
      response,
      "Failed to add expense"
    );
  } catch (error) {
    console.error(
      "ADD expense error:",
      error
    );

    throw error;
  }
};

// UPDATE EXPENSE
export const updateExpense = async (
  id,
  expense
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/expenses/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(expense),
      }
    );

    return await handleResponse(
      response,
      "Failed to update expense"
    );
  } catch (error) {
    console.error(
      "UPDATE expense error:",
      error
    );

    throw error;
  }
};

// DELETE EXPENSE
export const deleteExpense = async (id) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/expenses/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    return await handleResponse(
      response,
      "Failed to delete expense"
    );
  } catch (error) {
    console.error(
      "DELETE expense error:",
      error
    );

    throw error;
  }
};