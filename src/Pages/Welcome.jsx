import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* Top Bar */}
      <div className="h-15 border-b border-gray-400 flex items-center justify-between px-3">

        {/* Left message */}
        <p className="text-sm italic">
          Winners never quit, Quitters never win.
        </p>

        {/* Profile incomplete message */}
        <div className="bg-red-50 rounded-lg px-4 py-2 text-sm italic">

          <span>
            Your Profile is{" "}
            <span className="font-bold">
              incomplete.
            </span>{" "}
            A complete Profile has higher chance of landing a job.
          </span>

          <button
            onClick={() => navigate("/contact-details")}
            className="text-blue-600 underline ml-1 cursor-pointer"
          >
            Complete now
          </button>

        </div>

      </div>

      {/* Welcome Content */}
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">

        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Expense Tracker
        </h1>

      </div>

    </div>
  );
}

export default Welcome;