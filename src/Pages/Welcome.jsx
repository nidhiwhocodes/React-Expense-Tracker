import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function Welcome() {
  const navigate = useNavigate();

  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Logout
  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    navigate("/login");
  };

  // Get user information from Firebase
  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("token");

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

        // Profile status
        if (user?.displayName && user?.photoUrl) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }

        // Email verification status
        setEmailVerified(user?.emailVerified === true);
      } catch (error) {
        console.error("Profile error:", error);

        if (
          error.message === "INVALID_ID_TOKEN" ||
          error.message === "USER_NOT_FOUND"
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("email");

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // Send verification email
  const verifyEmailHandler = async () => {
    const token = localStorage.getItem("token");

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
        throw new Error(data.error?.message || "Unable to send email");
      }

      alert(
        `Verification email sent to ${data.email}. Please check your inbox and click the verification link.`
      );
    } catch (error) {
      console.error("Verification error:", error);

      switch (error.message) {
        case "INVALID_ID_TOKEN":
          alert("Your login session has expired. Please login again.");

          localStorage.removeItem("token");
          localStorage.removeItem("email");

          navigate("/login");
          break;

        case "USER_NOT_FOUND":
          alert("User account not found. Please login again.");

          localStorage.removeItem("token");
          localStorage.removeItem("email");

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Top Bar */}
      <div className="min-h-15 border-b border-gray-400 flex items-center justify-between px-3">

        {/* Left */}
        <p className="text-sm italic">
          Winners never quit, Quitters never win.
        </p>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Profile incomplete */}
          {!profileComplete && (
            <div className="bg-red-50 rounded-lg px-4 py-2 text-sm italic">
              Your Profile is{" "}
              <span className="font-bold">
                incomplete.
              </span>{" "}
              A complete Profile has higher chance of landing a job.

              <button
                onClick={() => navigate("/contact-details")}
                className="text-blue-600 underline ml-1"
              >
                Complete now
              </button>
            </div>
          )}

          {/* Email verification */}
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

          {/* Verified */}
          {emailVerified && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded text-sm">
              Email Verified ✓
            </div>
          )}

          {/* Logout */}
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

      {/* Welcome */}
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Expense Tracker
        </h1>
      </div>

    </div>
  );
}

export default Welcome;