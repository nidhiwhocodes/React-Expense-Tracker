import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Welcome from "./Pages/Welcome";
import Signup from "./Pages/Signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/welcome" element={<Welcome />} />
    </Routes>
  );
}

export default App;