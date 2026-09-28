import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function CompleteProfile() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const updateProfileHandler = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: token,
            displayName: fullName,
            photoUrl: photoUrl,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Profile update failed");
      }

      // Firebase can return a new ID token
      if (data.idToken) {
        localStorage.setItem("token", data.idToken);
      }

      alert("Profile updated successfully!");

      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Top bar */}
      <div className="border-b border-gray-400 px-2 py-1 flex justify-between items-center">

        <p className="text-sm italic">
          Winners never quit, Quitters never win.
        </p>

        <div className="bg-red-50 rounded-lg px-4 py-1 text-sm italic">
          Your Profile is <span className="font-bold">64% completed.</span>{" "}
          A complete Profile has higher chance of landing a job.
          <span className="text-blue-600 ml-1">
            Complete now
          </span>
        </div>

      </div>

      {/* Cancel */}
      <div className="flex justify-end px-14 mt-8">
        <button
          onClick={() => navigate("/profile")}
          className="
            border
            border-red-400
            text-red-500
            px-2
            py-1
            rounded
            hover:bg-red-50
          "
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="max-w-312.5 mx-auto -mt-1.25">

        <h2 className="text-xl font-semibold mb-8">
          Contact Details
        </h2>

        <form onSubmit={updateProfileHandler}>

          <div className="grid grid-cols-2 gap-14">

            {/* Full Name */}
            <div className="flex items-center gap-4">

              <label className="font-semibold whitespace-nowrap">
                <span className="text-xl mr-2">◉</span>
                Full Name:
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="
                  border
                  border-gray-400
                  h-7
                  flex-1
                  px-2
                  outline-none
                  focus:border-blue-500
                "
                required
              />

            </div>

            {/* Profile Photo URL */}
            <div className="flex items-center gap-4">

              <label className="font-semibold whitespace-nowrap">
                <span className="text-xl mr-2">◉</span>
                Profile Photo URL
              </label>

              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="
                  border
                  border-gray-400
                  h-7
                  flex-1
                  px-2
                  outline-none
                  focus:border-blue-500
                "
                required
              />

            </div>

          </div>

          {/* Update */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-7
              bg-red-400
              hover:bg-red-500
              text-white
              px-3
              py-1.5
              rounded
              disabled:opacity-50
            "
          >
            {loading ? "Updating..." : "Update"}
          </button>

        </form>

        <div className="border-b border-gray-400 mt-4"></div>

      </div>

    </div>
  );
}

export default CompleteProfile;