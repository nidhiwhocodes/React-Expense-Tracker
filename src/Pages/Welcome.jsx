import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const DATABASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

function Welcome() {
  const navigate = useNavigate();

  // ==========================================
  // USER STATES
  // ==========================================

  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [userId, setUserId] = useState("");

  // ==========================================
  // ADD EXPENSE STATES
  // ==========================================

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");

  const [expenses, setExpenses] = useState([]);

  const [expenseLoading, setExpenseLoading] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);

  // ==========================================
  // EDIT EXPENSE STATES
  // ==========================================

  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Food");

  const [updatingExpense, setUpdatingExpense] = useState(false);

  // ==========================================
  // DELETE EXPENSE STATE
  // ==========================================

  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  // ==========================================
  // GET USER DETAILS + GET EXPENSES
  // ==========================================

  useEffect(() => {
    const getUserDetailsAndExpenses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // ------------------------------------------
        // GET USER DETAILS FROM FIREBASE
        // ------------------------------------------

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

        console.log("User details response:", data);

        if (!response.ok) {
          throw new Error(
            data.error?.message || "Failed to get user"
          );
        }

        const user = data.users?.[0];

        if (!user) {
          localStorage.removeItem("token");
          localStorage.removeItem("email");

          navigate("/login");
          return;
        }

        // ------------------------------------------
        // SAVE USER ID
        // ------------------------------------------

        setUserId(user.localId);

        // ------------------------------------------
        // CHECK PROFILE
        // ------------------------------------------

        setProfileComplete(
          Boolean(user.displayName && user.photoUrl)
        );

        // ------------------------------------------
        // CHECK EMAIL VERIFICATION
        // ------------------------------------------

        setEmailVerified(Boolean(user.emailVerified));

        // ------------------------------------------
        // GET EXPENSES
        // ------------------------------------------

        setExpenseLoading(true);

        const expensesResponse = await fetch(
          `${DATABASE_URL}/expenses/${user.localId}.json?auth=${token}`
        );

        if (!expensesResponse.ok) {
          const expensesError = await expensesResponse.json();

          throw new Error(
            expensesError.error || "Failed to fetch expenses"
          );
        }

        const expensesData = await expensesResponse.json();

        console.log("Expenses GET response:", expensesData);

        if (expensesData) {
          const expensesArray = Object.entries(expensesData).map(
            ([id, expense]) => ({
              id,
              ...expense,
            })
          );

          setExpenses(expensesArray);
        } else {
          setExpenses([]);
        }
      } catch (error) {
        console.error(
          "User/expense loading error:",
          error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        navigate("/login");
      } finally {
        setLoading(false);
        setExpenseLoading(false);
      }
    };

    getUserDetailsAndExpenses();
  }, [navigate]);

  // ==========================================
  // ADD EXPENSE
  // ==========================================

  const addExpenseHandler = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!amount || !description || !category) {
      alert("Please fill all the fields");
      return;
    }

    // Validate amount
    if (Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!userId) {
      alert(
        "User information is not available. Please try again."
      );
      return;
    }

    const newExpense = {
      amount: Number(amount),
      description: description.trim(),
      category: category,
    };

    setAddingExpense(true);

    try {
      // ------------------------------------------
      // POST EXPENSE TO FIREBASE
      // ------------------------------------------

      const response = await fetch(
        `${DATABASE_URL}/expenses/${userId}.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newExpense),
        }
      );

      const data = await response.json();

      console.log("Add expense response:", data);

      // ------------------------------------------
      // CHECK RESPONSE
      // ------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add expense"
        );
      }

      // ------------------------------------------
      // ADD TO SCREEN ONLY AFTER SUCCESS
      // ------------------------------------------

      const expenseWithId = {
        id: data.name,
        ...newExpense,
      };

      setExpenses((previousExpenses) => [
        ...previousExpenses,
        expenseWithId,
      ]);

      // ------------------------------------------
      // CLEAR FORM
      // ------------------------------------------

      setAmount("");
      setDescription("");
      setCategory("Food");
    } catch (error) {
      console.error("Add expense error:", error);

      alert(
        error.message ||
          "Failed to add expense. Please try again."
      );
    } finally {
      setAddingExpense(false);
    }
  };

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  const deleteExpenseHandler = async (expenseId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setDeletingExpenseId(expenseId);

    try {
      // ------------------------------------------
      // DELETE REQUEST
      // ------------------------------------------

      const response = await fetch(
        `${DATABASE_URL}/expenses/${userId}/${expenseId}.json?auth=${token}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      console.log("Delete expense response:", data);

      // ------------------------------------------
      // CHECK RESPONSE
      // ------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete expense"
        );
      }

      // ------------------------------------------
      // REMOVE FROM UI AFTER SUCCESS
      // ------------------------------------------

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense.id !== expenseId
        )
      );

      console.log("Expense successfuly deleted");
    } catch (error) {
      console.error("Delete expense error:", error);

      alert(
        error.message ||
          "Failed to delete expense. Please try again."
      );
    } finally {
      setDeletingExpenseId(null);
    }
  };

  // ==========================================
  // START EDITING EXPENSE
  // ==========================================

  const editExpenseHandler = (expense) => {
    setEditingExpenseId(expense.id);

    setEditAmount(expense.amount);
    setEditDescription(expense.description);
    setEditCategory(expense.category);
  };

  // ==========================================
  // UPDATE EXPENSE
  // ==========================================

  const updateExpenseHandler = async (e, expenseId) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (
      !editAmount ||
      !editDescription ||
      !editCategory
    ) {
      alert("Please fill all the fields");
      return;
    }

    if (Number(editAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const updatedExpense = {
      amount: Number(editAmount),
      description: editDescription.trim(),
      category: editCategory,
    };

    setUpdatingExpense(true);

    try {
      // ------------------------------------------
      // PUT REQUEST
      // ------------------------------------------

      const response = await fetch(
        `${DATABASE_URL}/expenses/${userId}/${expenseId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedExpense),
        }
      );

      const data = await response.json();

      console.log(
        "Update expense response:",
        data
      );

      // ------------------------------------------
      // CHECK RESPONSE
      // ------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update expense"
        );
      }

      // ------------------------------------------
      // UPDATE UI AFTER SUCCESS
      // ------------------------------------------

      setExpenses((previousExpenses) =>
        previousExpenses.map((expense) =>
          expense.id === expenseId
            ? {
                id: expenseId,
                ...updatedExpense,
              }
            : expense
        )
      );

      // ------------------------------------------
      // EXIT EDIT MODE
      // ------------------------------------------

      setEditingExpenseId(null);

      setEditAmount("");
      setEditDescription("");
      setEditCategory("Food");
    } catch (error) {
      console.error(
        "Update expense error:",
        error
      );

      alert(
        error.message ||
          "Failed to update expense. Please try again."
      );
    } finally {
      setUpdatingExpense(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    navigate("/login");
  };

  // ==========================================
  // VERIFY EMAIL
  // ==========================================

  const verifyEmailHandler = async () => {
    const token = localStorage.getItem("token");

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

      console.log(
        "Verification email response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Failed to send email"
        );
      }

      alert(
        `Verification email sent to ${data.email}`
      );
    } catch (error) {
      console.error(
        "Email verification error:",
        error
      );

      if (
        error.message === "INVALID_ID_TOKEN"
      ) {
        alert(
          "Your session has expired. Please login again."
        );

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        navigate("/login");
      } else if (
        error.message === "USER_NOT_FOUND"
      ) {
        alert("User account not found.");

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        navigate("/login");
      } else {
        alert(error.message);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // ==========================================
  // PAGE LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="
            w-10
            h-10
            border-4
            border-gray-300
            border-t-blue-500
            rounded-full
            animate-spin
          "
        ></div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ======================================
          TOP BAR
          ====================================== */}

      <div
        className="
          min-h-15
          bg-white
          border-b
          border-gray-300
          flex
          items-center
          justify-between
          px-4
        "
      >

        {/* Quote */}
        <p className="text-sm italic">
          Winners never quit, Quitters never win.
        </p>

        <div className="flex items-center gap-3">

          {/* ==================================
              PROFILE INCOMPLETE
              ================================== */}

          {!profileComplete && (
            <div
              className="
                bg-red-50
                rounded-lg
                px-4
                py-2
                text-sm
                italic
              "
            >
              Your Profile is{" "}
              <span className="font-bold">
                incomplete.
              </span>{" "}
              A complete Profile has higher chance
              of landing a job.

              <button
                onClick={() =>
                  navigate("/contact-details")
                }
                className="
                  text-blue-600
                  underline
                  ml-1
                "
              >
                Complete now
              </button>
            </div>
          )}

          {/* ==================================
              EMAIL VERIFICATION
              ================================== */}

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

          {emailVerified && (
            <div
              className="
                bg-green-50
                text-green-700
                px-4
                py-2
                rounded
                text-sm
              "
            >
              Email Verified ✓
            </div>
          )}

          {/* ==================================
              LOGOUT
              ================================== */}

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

      {/* ======================================
          MAIN CONTENT
          ====================================== */}

      <div
        className="
          max-w-4xl
          mx-auto
          px-4
          py-10
        "
      >

        {/* ==================================
            WELCOME
            ================================== */}

        <h1
          className="
            text-3xl
            font-bold
            text-center
            mb-8
          "
        >
          Welcome to Expense Tracker
        </h1>

        {/* ==================================
            ADD EXPENSE FORM
            ================================== */}

        <div
          className="
            bg-white
            rounded-lg
            shadow-md
            p-6
          "
        >

          <h2
            className="
              text-xl
              font-bold
              mb-5
            "
          >
            Add Daily Expense
          </h2>

          <form
            onSubmit={addExpenseHandler}
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            "
          >

            {/* ==============================
                AMOUNT
                ============================== */}

            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Amount
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                disabled={addingExpense}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded
                  px-3
                  py-2
                  outline-none
                  focus:border-blue-500
                  disabled:bg-gray-100
                "
              />
            </div>

            {/* ==============================
                DESCRIPTION
                ============================== */}

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
                disabled={addingExpense}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded
                  px-3
                  py-2
                  outline-none
                  focus:border-blue-500
                  disabled:bg-gray-100
                "
              />
            </div>

            {/* ==============================
                CATEGORY
                ============================== */}

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
                disabled={addingExpense}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded
                  px-3
                  py-2
                  outline-none
                  focus:border-blue-500
                  bg-white
                  disabled:bg-gray-100
                "
              >
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

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* ==============================
                ADD BUTTON
                ============================== */}

            <div className="md:col-span-3">

              <button
                type="submit"
                disabled={addingExpense}
                className="
                  w-full
                  bg-blue-500
                  hover:bg-blue-600
                  text-white
                  py-2
                  rounded
                  font-medium
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {addingExpense
                  ? "Adding Expense..."
                  : "Add Expense"}
              </button>

            </div>

          </form>
        </div>

        {/* ======================================
            EXPENSE LIST
            ====================================== */}

        <div className="mt-8">

          <h2
            className="
              text-xl
              font-bold
              mb-4
            "
          >
            Your Expenses
          </h2>

          {/* ==================================
              LOADING EXPENSES
              ================================== */}

          {expenseLoading ? (

            <div
              className="
                bg-white
                rounded-lg
                shadow
                p-6
                flex
                justify-center
              "
            >
              <div
                className="
                  w-8
                  h-8
                  border-4
                  border-gray-300
                  border-t-blue-500
                  rounded-full
                  animate-spin
                "
              ></div>
            </div>

          ) : expenses.length === 0 ? (

            /* ==================================
               NO EXPENSES
               ================================== */

            <div
              className="
                bg-white
                rounded-lg
                shadow
                p-6
                text-center
                text-gray-500
              "
            >
              No expenses added yet.
            </div>

          ) : (

            /* ==================================
               EXPENSES
               ================================== */

            <div className="space-y-3">

              {expenses.map((expense) => (

                <div
                  key={expense.id}
                  className="
                    bg-white
                    rounded-lg
                    shadow
                    p-4
                  "
                >

                  {editingExpenseId === expense.id ? (

                    /* ==================================
                       EDIT MODE
                       ================================== */

                    <form
                      onSubmit={(e) =>
                        updateExpenseHandler(
                          e,
                          expense.id
                        )
                      }
                      className="
                        grid
                        grid-cols-1
                        md:grid-cols-4
                        gap-3
                        items-end
                      "
                    >

                      {/* Edit Amount */}

                      <div>
                        <label
                          className="
                            block
                            text-sm
                            font-medium
                            mb-1
                          "
                        >
                          Amount
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(
                              e.target.value
                            )
                          }
                          disabled={updatingExpense}
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

                      {/* Edit Description */}

                      <div>
                        <label
                          className="
                            block
                            text-sm
                            font-medium
                            mb-1
                          "
                        >
                          Description
                        </label>

                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) =>
                            setEditDescription(
                              e.target.value
                            )
                          }
                          disabled={updatingExpense}
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

                      {/* Edit Category */}

                      <div>
                        <label
                          className="
                            block
                            text-sm
                            font-medium
                            mb-1
                          "
                        >
                          Category
                        </label>

                        <select
                          value={editCategory}
                          onChange={(e) =>
                            setEditCategory(
                              e.target.value
                            )
                          }
                          disabled={updatingExpense}
                          className="
                            w-full
                            border
                            border-gray-300
                            rounded
                            px-3
                            py-2
                            outline-none
                            focus:border-blue-500
                            bg-white
                          "
                        >
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

                          <option value="Entertainment">
                            Entertainment
                          </option>

                          <option value="Bills">
                            Bills
                          </option>

                          <option value="Other">
                            Other
                          </option>
                        </select>
                      </div>

                      {/* Submit */}

                      <button
                        type="submit"
                        disabled={updatingExpense}
                        className="
                          bg-green-500
                          hover:bg-green-600
                          text-white
                          px-4
                          py-2
                          rounded
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingExpense
                          ? "Updating..."
                          : "Submit"}
                      </button>

                    </form>

                  ) : (

                    /* ==================================
                       NORMAL MODE
                       ================================== */

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >

                      {/* Expense Information */}

                      <div>

                        <h3
                          className="
                            font-semibold
                            text-lg
                          "
                        >
                          {expense.description}
                        </h3>

                        <p
                          className="
                            text-sm
                            text-gray-500
                          "
                        >
                          Category:{" "}
                          {expense.category}
                        </p>

                      </div>

                      {/* Amount + Buttons */}

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <p
                          className="
                            font-bold
                            text-lg
                          "
                        >
                          ₹{expense.amount}
                        </p>

                        {/* Edit Button */}

                        <button
                          onClick={() =>
                            editExpenseHandler(
                              expense
                            )
                          }
                          className="
                            bg-yellow-500
                            hover:bg-yellow-600
                            text-white
                            px-4
                            py-2
                            rounded
                            text-sm
                          "
                        >
                          Edit
                        </button>

                        {/* Delete Button */}

                        <button
                          onClick={() =>
                            deleteExpenseHandler(
                              expense.id
                            )
                          }
                          disabled={
                            deletingExpenseId ===
                            expense.id
                          }
                          className="
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            px-4
                            py-2
                            rounded
                            text-sm
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {deletingExpenseId ===
                          expense.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  )}

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