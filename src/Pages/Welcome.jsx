import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../context/useAuth";
import useExpenses from "../context/useExpenses";
import useTheme from "../context/useTheme";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function Welcome() {
  const navigate = useNavigate();

  // Auth context
  const { authState, dispatch: authDispatch } = useAuth();

  // Expense context
  const { expenses, dispatch: expenseDispatch } = useExpenses();

  // Theme context
  const { themeState, dispatch: themeDispatch } = useTheme();

  // Profile state
  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Expense form states
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Get token from reducer or localStorage
  const token = authState.token || localStorage.getItem("token");

  // --------------------------------------------------
  // GET USER DETAILS FROM FIREBASE
  // --------------------------------------------------

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: token,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message || "Unable to fetch user details"
          );
        }

        const user = data.users?.[0];

        if (!user) {
          throw new Error("User details not found");
        }

        // Check profile completion
        if (user.displayName && user.photoUrl) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }

        // Check email verification directly from Firebase
        setEmailVerified(user.emailVerified || false);
      } catch (error) {
        console.error("User details error:", error);

        // Token may be expired/invalid
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        authDispatch({
          type: "LOGOUT",
        });

        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [token, navigate, authDispatch]);

  // --------------------------------------------------
  // VERIFY EMAIL
  // --------------------------------------------------

  const verifyEmailHandler = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken: token,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Unable to send verification email"
        );
      }

      alert("Verification email sent successfully!");
    } catch (error) {
      console.error("Verification email error:", error);
      alert(error.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    authDispatch({
      type: "LOGOUT",
    });

    expenseDispatch({
      type: "CLEAR_EXPENSES",
    });

    navigate("/login");
  };

  // --------------------------------------------------
  // ADD EXPENSE
  // --------------------------------------------------

  const addExpenseHandler = (e) => {
    e.preventDefault();

    if (!amount || !description || !category) {
      alert("Please fill all expense fields.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      description,
      category,
    };

    expenseDispatch({
      type: "ADD_EXPENSE",
      payload: newExpense,
    });

    // Clear form
    setAmount("");
    setDescription("");
    setCategory("");
  };

  // --------------------------------------------------
  // TOTAL EXPENSE
  // --------------------------------------------------

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  // --------------------------------------------------
  // DOWNLOAD EXPENSES AS CSV
  // --------------------------------------------------

  const downloadExpensesHandler = () => {
    if (expenses.length === 0) {
      alert("No expenses available to download.");
      return;
    }

    const headers = ["Amount", "Description", "Category"];

    const rows = expenses.map((expense) => [
      expense.amount,
      expense.description,
      expense.category,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "my-expenses.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        themeState.isDark
          ? "bg-gray-900 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* ================= HEADER ================= */}

      <header
        className={`border-b ${
          themeState.isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Expense Tracker
          </h1>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}

            {themeState.isPremium && (
              <button
                onClick={() =>
                  themeDispatch({
                    type: "TOGGLE_THEME",
                  })
                }
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {themeState.isDark
                  ? "☀️ Light Mode"
                  : "🌙 Dark Mode"}
              </button>
            )}

            {/* Logout */}

            <button
              onClick={logoutHandler}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ================= PROFILE MESSAGE ================= */}

        {!profileComplete && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              themeState.isDark
                ? "bg-yellow-900/30 border-yellow-700"
                : "bg-yellow-50 border-yellow-300"
            }`}
          >
            <p className="font-medium">
              Your Profile is incomplete.
            </p>

            <p className="text-sm mt-1">
              A complete Profile has higher chance of landing a
              job.
            </p>

            <button
              onClick={() => navigate("/contact-details")}
              className="mt-3 text-blue-500 hover:underline font-medium"
            >
              Complete now
            </button>
          </div>
        )}

        {/* ================= WELCOME ================= */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome to Expense Tracker
          </h2>

          <p
            className={`mt-2 ${
              themeState.isDark
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            Manage your daily expenses easily.
          </p>
        </div>

        {/* ================= EMAIL VERIFICATION ================= */}

        <div
          className={`mb-8 p-5 rounded-lg border ${
            themeState.isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <h3 className="text-lg font-semibold">
            Email Verification
          </h3>

          {emailVerified ? (
            <p className="mt-2 text-green-500 font-medium">
              ✓ Your email is verified.
            </p>
          ) : (
            <div>
              <p className="mt-2 text-red-500">
                Your email is not verified.
              </p>

              <button
                onClick={verifyEmailHandler}
                disabled={sendingEmail}
                className="mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition"
              >
                {sendingEmail
                  ? "Sending..."
                  : "Verify Email ID"}
              </button>
            </div>
          )}
        </div>

        {/* ================= EXPENSE FORM ================= */}

        <div
          className={`border rounded-lg p-6 shadow-sm ${
            themeState.isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <h2 className="text-xl font-semibold mb-5">
            Add Daily Expense
          </h2>

          <form onSubmit={addExpenseHandler}>
            {/* Amount */}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Amount
              </label>

              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-2 rounded border outline-none ${
                  themeState.isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Description */}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <input
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className={`w-full px-4 py-2 rounded border outline-none ${
                  themeState.isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Category */}

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2 rounded border outline-none ${
                  themeState.isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">
                  Select Category
                </option>

                <option value="Food">Food</option>

                <option value="Travel">Travel</option>

                <option value="Shopping">Shopping</option>

                <option value="Bills">Bills</option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* ================= TOTAL EXPENSE ================= */}

        <div
          className={`mt-8 border rounded-lg p-5 ${
            themeState.isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <h2 className="text-xl font-semibold">
            Total Expenses
          </h2>

          <p className="text-2xl font-bold text-red-500 mt-2">
            ₹{totalExpenses}
          </p>

          {/* PREMIUM BUTTON */}

          {totalExpenses > 10000 &&
            !themeState.isPremium && (
              <button
                onClick={() =>
                  themeDispatch({
                    type: "ACTIVATE_PREMIUM",
                  })
                }
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded font-medium transition"
              >
                Activate Premium
              </button>
            )}

          {/* PREMIUM FEATURES */}

          {themeState.isPremium && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Theme Toggle */}

              <button
                onClick={() =>
                  themeDispatch({
                    type: "TOGGLE_THEME",
                  })
                }
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {themeState.isDark
                  ? "☀️ Light Mode"
                  : "🌙 Dark Mode"}
              </button>

              {/* Download CSV */}

              <button
                onClick={downloadExpensesHandler}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Download Expenses
              </button>
            </div>
          )}
        </div>

        {/* ================= EXPENSE LIST ================= */}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Your Expenses
          </h2>

          {expenses.length === 0 ? (
            <div
              className={`p-5 rounded-lg border ${
                themeState.isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <p
                className={
                  themeState.isDark
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                No expenses added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    themeState.isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold">
                      {expense.description}
                    </h3>

                    <p
                      className={`text-sm ${
                        themeState.isDark
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      Category: {expense.category}
                    </p>
                  </div>

                  <p className="font-bold text-lg text-green-500">
                    ₹{expense.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Welcome;