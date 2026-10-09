import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Welcome from "./Pages/Welcome";
import CompleteProfile from "./Pages/CompleteProfile";
import ForgotPassword from "./Pages/ForgotPassword";


function App() {
  return (
  
    
      <Routes>
        
        <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/welcome" element={<Welcome />} />

      <Route path="/contact-details" element={<CompleteProfile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  
  );
}

export default App;
