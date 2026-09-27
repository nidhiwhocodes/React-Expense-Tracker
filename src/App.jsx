import { Routes, Route } from "react-router-dom";
import Signup from "./Pages/Signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
    </Routes>
  );
}

export default App;