import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
console.log("API KEY:", API_KEY);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Login failed");
      }

      // Store Firebase token
      localStorage.setItem("token", data.idToken);

      // Store user email
      localStorage.setItem("email", data.email);

      // Redirect after successful login
      navigate("/welcome");
   } catch (error) {
  console.error("Login error:", error);
  alert(error.message);
}
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Blue background shape */}
      <div
        className="
          absolute
          top-0
          right-0
          w-[47%]
          h-[55%]
          bg-blue-600
          rounded-bl-[55%]
        "
      ></div>

      {/* Login content */}
      <div className="relative z-10 flex flex-col items-center pt-52.5">

        {/* Login Card */}
        <div className="w-58.75 min-h-65 bg-white border border-gray-300 px-4 py-7">

          <h2 className="text-center text-xl font-medium mb-7">
            Login
          </h2>

          <form onSubmit={loginHandler}>

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full
                h-9.5
                mb-3
                px-3
                rounded-full
                bg-black
                text-white
                text-xs
                outline-none
                placeholder:text-gray-500
              "
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full
                h-9.5
                mb-3
                px-3
                rounded-full
                bg-black
                text-white
                text-xs
                outline-none
                placeholder:text-gray-500
              "
            />

            {/* Login Button */}
            <button
              type="submit"
              className="
                w-full
                h-7.5
                mt-3
                rounded-full
                bg-sky-500
                hover:bg-sky-600
                text-white
                text-sm
                transition
              "
            >
              Login
            </button>
          </form>

          {/* Forgot Password */}
          <button
            type="button"
            className="
              block
              mx-auto
              mt-2
              text-xs
              text-purple-700
              underline
            "
          >
            Forgot password
          </button>
        </div>

        {/* Signup */}
        <button
          onClick={() => navigate("/signup")}
          className="
            w-58.75
            h-7.5
            mt-3
            rounded
            border
            border-gray-500
            bg-green-50
            text-xs
            text-gray-700
            hover:bg-green-100
          "
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
}

export default Login;