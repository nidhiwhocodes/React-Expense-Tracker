import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestType: "PASSWORD_RESET",
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log("Firebase response:", data);

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong");
      }

      alert(`Password reset link has been sent to ${data.email}`);

      navigate("/login");
    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.message === "EMAIL_NOT_FOUND") {
        alert("No account exists with this email address.");
      } else if (error.message === "INVALID_EMAIL") {
        alert("Please enter a valid email address.");
      } else if (error.message === "TOO_MANY_ATTEMPTS_TRY_LATER") {
        alert("Too many attempts. Please try again later.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md">

        <h1 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Enter your registered email address to reset your password.
        </p>

        <form onSubmit={forgotPasswordHandler}>

          <label className="block text-sm font-medium mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="
              w-full
              border
              border-gray-300
              rounded
              px-4
              py-3
              mb-5
              outline-none
              focus:border-blue-500
              disabled:bg-gray-100
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-500
              hover:bg-blue-600
              text-white
              py-3
              rounded
              font-medium
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          disabled={loading}
          className="w-full mt-4 text-blue-600 hover:underline text-sm"
        >
          Back to Login
        </button>

        {loading && (
          <div className="flex justify-center mt-6">
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
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;