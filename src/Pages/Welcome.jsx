import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../context/useAuth";
import useExpenses from "../context/useExpenses";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function Welcome() {
  const navigate = useNavigate();

  // =========================
  // AUTH REDUCER
  // =========================

  const { authState, dispatch: authDispatch } = useAuth();

  // =========================
  // EXPENSE REDUCER
  // =========================

  const {
    expenses,
    dispatch: expenseDispatch,
  } = useExpenses();

  // =========================
  // PROFILE STATES
  // =========================

  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  // =========================
  // EXPENSE FORM STATES
  // =========================

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // =========================
  // GET TOKEN
  // =========================

  const token =
    authState.token || localStorage.getItem("token");

  // =========================
  // GET USER PROFILE
  // =========================

  useEffect(() => {
    const getProfile = async () => {
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
            data.error?.message ||
              "Unable to fetch user details"
          );
        }

        const user = data.users?.[0];

        // Store user ID in Auth Reducer
        if (user?.localId) {
          authDispatch({
            type: "LOGIN",
            payload: {
              token: token,
              userId: user.localId,
            },
          });
        }

        // Check profile completion
        //
        // Change these fields according to the fields
        // you save while completing the profile.
        if (user?.displayName && user?.photoUrl) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }

        // Check email verification
        setEmailVerified(user?.emailVerified === true);

      } catch (error) {
        console.error("Profile error:", error);

        if (
          error.message === "INVALID_ID_TOKEN" ||
          error.message === "USER_NOT_FOUND"
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("email");

          authDispatch({
            type: "LOGOUT",
          });

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [token, navigate, authDispatch]);

  // =========================
  // SEND VERIFICATION EMAIL
  // =========================

  const verifyEmailHandler = async () => {
    if (!token) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    try {
      setSendingEmail(true);

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
          data.error?.message ||
            "Unable to send verification email"
        );
      }

      alert(
        `Verification email sent to ${data.email}. Please check your email and click the verification link.`
      );
    } catch (error) {
      console.error("Verification error:", error);

      switch (error.message) {
        case "INVALID_ID_TOKEN":
          alert(
            "Your login session has expired. Please login again."
          );

          localStorage.removeItem("token");
          localStorage.removeItem("email");

          authDispatch({
            type: "LOGOUT",
          });

          navigate("/login");

          break;

        case "USER_NOT_FOUND":
          alert("User account not found. Please login again.");

          localStorage.removeItem("token");
          localStorage.removeItem("email");

          authDispatch({
            type: "LOGOUT",
          });

          navigate("/login");

          break;

        default:
          alert(
            "Unable to send verification email. Please try again."
          );
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logoutHandler = () => {
    // Remove token
    localStorage.removeItem("token");

    // Remove email
    localStorage.removeItem("email");

    // Clear Auth Reducer
    authDispatch({
      type: "LOGOUT",
    });

    // Clear Expense Reducer
    expenseDispatch({
      type: "CLEAR_EXPENSES",
    });

    // Redirect to login
    navigate("/login");
  };

  // =========================
  // ADD EXPENSE
  // =========================

  const addExpenseHandler = (e) => {
    e.preventDefault();

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      description: description,
      category: category,
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

  // =========================
  // CALCULATE TOTAL EXPENSE
  // =========================

  const totalExpenses = expenses.reduce(
    (total, expense) => {
      return total + Number(expense.amount);
    },
    0
  );

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">
          Loading...
        </p>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================
          TOP BAR
      ========================= */}

      <div
        className="
          min-h-15
          bg-white
          border-b
          border-gray-300
          flex
          items-center
          justify-between
          px-6
          py-3
          gap-4
        "
      >

        {/* LEFT SIDE */}

        <p className="text-sm italic text-gray-600">
          Winners never quit, Quitters never win.
        </p>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3">

          {/* PROFILE INCOMPLETE */}

          {!profileComplete && (
            <div
              className="
                bg-red-50
                border
                border-red-200
                rounded-lg
                px-4
                py-2
                text-sm
              "
            >
              <span className="italic">
                Your Profile is{" "}
              </span>

              <span className="font-bold">
                incomplete.
              </span>

              <button
                onClick={() =>
                  navigate("/contact-details")
                }
                className="
                  text-blue-600
                  underline
                  ml-2
                  hover:text-blue-800
                "
              >
                Complete now
              </button>
            </div>
          )}

          {/* VERIFY EMAIL */}

          {!emailVerified && (
            <button
              onClick={verifyEmailHandler}
              disabled={sendingEmail}
              className="
                bg-blue-500
                hover:bg-blue-600
                text-white
                px-4
                py-2
                rounded
                text-sm
                disabled:opacity-50
              "
            >
              {sendingEmail
                ? "Sending..."
                : "Verify Email ID"}
            </button>
          )}

          {/* EMAIL VERIFIED */}

          {emailVerified && (
            <div
              className="
                bg-green-50
                text-green-700
                border
                border-green-200
                px-4
                py-2
                rounded
                text-sm
              "
            >
              Email Verified ✓
            </div>
          )}

          {/* LOGOUT */}

          <button
            onClick={logoutHandler}
            className="
              bg-red-500
              hover:bg-red-600
              text-white
              px-4
              py-2
              rounded
              text-sm
            "
          >
            Logout
          </button>

        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div
        className="
          max-w-6xl
          mx-auto
          px-6
          py-10
        "
      >

        {/* WELCOME */}

        <h1
          className="
            text-3xl
            font-bold
            text-gray-800
            mb-8
          "
        >
          Welcome to Expense Tracker
        </h1>

        {/* =========================
            ADD EXPENSE FORM
        ========================= */}

        <form
          onSubmit={addExpenseHandler}
          className="
            bg-white
            border
            border-gray-300
            rounded-lg
            p-6
            shadow-sm
          "
        >

          <h2
            className="
              text-xl
              font-semibold
              mb-5
            "
          >
            Add Daily Expense
          </h2>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            "
          >

            {/* MONEY SPENT */}

            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Money Spent
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                required
                className="
                  w-full
                  border
                  border-gray-300
                  rounded
                  px-3
                  py-2
                  outline-none
                  focus:border-blue-500
                "
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Description
              </label>

              <input
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
                className="
                  w-full
                  border
                  border-gray-300
                  rounded
                  px-3
                  py-2
                  outline-none
                  focus:border-blue-500
                "
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
                className="
                  w-full
                  border
                  border-gray-300
                  rounded
                  px-3
                  py-2
                  bg-white
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value="">
                  Select category
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Petrol">
                  Petrol
                </option>

                <option value="Salary">
                  Salary
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Travel">
                  Travel
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

          </div>

          {/* ADD EXPENSE BUTTON */}

          <button
            type="submit"
            className="
              mt-5
              bg-blue-500
              hover:bg-blue-600
              text-white
              px-5
              py-2
              rounded
            "
          >
            Add Expense
          </button>

        </form>

        {/* =========================
            TOTAL EXPENSE
        ========================= */}

        <div
          className="
            mt-8
            bg-white
            border
            border-gray-300
            rounded-lg
            p-5
          "
        >

          <h2 className="text-xl font-semibold">
            Total Expenses
          </h2>

          <p
            className="
              text-2xl
              font-bold
              text-red-500
              mt-2
            "
          >
            ₹{totalExpenses}
          </p>

          {/* PREMIUM BUTTON */}

          {totalExpenses > 10000 && (
            <button
              className="
                mt-4
                bg-yellow-500
                hover:bg-yellow-600
                text-white
                px-5
                py-2
                rounded
                font-medium
              "
            >
              Activate Premium
            </button>
          )}

        </div>

        {/* =========================
            EXPENSE LIST
        ========================= */}

        <div className="mt-8">

          <h2
            className="
              text-xl
              font-semibold
              mb-4
            "
          >
            Your Daily Expenses
          </h2>

          {/* NO EXPENSES */}

          {expenses.length === 0 ? (
            <div
              className="
                bg-white
                border
                border-gray-300
                rounded-lg
                p-5
                text-gray-500
              "
            >
              No expenses added yet.
            </div>
          ) : (

            /* EXPENSES */

            <div className="space-y-3">

              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="
                    bg-white
                    border
                    border-gray-300
                    rounded-lg
                    p-4
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <h3 className="font-semibold">
                      {expense.description}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Category: {expense.category}
                    </p>

                  </div>

                  <p
                    className="
                      text-lg
                      font-semibold
                      text-red-500
                    "
                  >
                    ₹{expense.amount}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Welcome;