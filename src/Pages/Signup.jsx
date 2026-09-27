import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    // Check all fields
    if (!email || !password || !confirmPassword) {
      setError("All fields are mandatory.");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User has successfully signed up.");

      navigate("/login");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please login.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Button disabled until all fields are filled
  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  return (
    <div className="relative min-h-[calc(100vh-40px)] overflow-hidden bg-white flex items-center justify-center">

      {/* Blue shape */}
      <div
        className="
          absolute
          top-0
          right-0
          w-[40%]
          h-88.75
          bg-blue-600
          rounded-bl-[60%]
          z-0
        "
      ></div>

      {/* Signup Container */}
      <div className="relative z-10 w-56.25 mt-5">

        {/* Signup Card */}
        <div className="bg-white border border-gray-300 p-[25px_15px_23px]">

          <h2 className="text-center text-xl font-normal mb-5.5">
            SignUp
          </h2>

          <form
            onSubmit={handleSignup}
            className="flex flex-col gap-1.75"
          >

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                h-7.75
                px-2
                border
                border-gray-200
                rounded
                text-[10px]
                outline-none
                focus:border-blue-400
              "
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                h-7.75
                px-2
                border
                border-gray-200
                rounded
                text-[10px]
                outline-none
                focus:border-blue-400
              "
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="
                w-full
                h-7.75
                px-2
                border
                border-gray-200
                rounded
                text-[10px]
                outline-none
                focus:border-blue-400
              "
            />

            {/* Password mismatch */}
            {confirmPassword &&
              password !== confirmPassword && (
                <p className="text-[10px] text-red-500">
                  Passwords do not match.
                </p>
              )}

            {/* Firebase Error */}
            {error && (
              <p className="text-[10px] text-red-500 leading-3.5">
                {error}
              </p>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="
                w-full
                h-7.5
                mt-3.75
                rounded-full
                bg-sky-500
                text-white
                text-xs
                hover:bg-sky-600
                disabled:bg-sky-200
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>

          </form>
        </div>

        {/* Login Box */}
        <div
          className="
            mt-3
            p-2.5
            text-center
            bg-green-50
            border
            border-gray-400
            rounded
            text-[11px]
          "
        >
          <span>Have an account? </span>

          <Link
            to="/login"
            className="text-gray-800 font-medium hover:underline"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;