import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Planner from "./pages/Planner";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* 1️⃣ Landing page (Get Started + Auth Modal) */}
        <Route path="/" element={<Landing />} />

        {/* 2️⃣ Planner page (after login/signup) */}
        <Route path="/planner" element={<Planner />} />

        {/* 3️⃣ Safety fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}
