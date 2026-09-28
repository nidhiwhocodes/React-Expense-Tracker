import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function Welcome() {
  const navigate = useNavigate();

  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

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
            data.error?.message || "Unable to fetch profile"
          );
        }

        const user = data.users?.[0];

        // Check whether profile information exists
        if (user?.displayName && user?.photoUrl) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

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
      <div className="h-15 border-b border-gray-400 flex items-center justify-between px-3">

        <p className="text-sm italic">
          Winners never quit, Quitters never win.
        </p>

        {/* Profile message */}
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

        {/* Completed message */}
        {profileComplete && (
          <div className="bg-green-50 rounded-lg px-4 py-2 text-sm">
            Your Profile is{" "}
            <span className="font-bold text-green-700">
              complete.
            </span>
          </div>
        )}

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