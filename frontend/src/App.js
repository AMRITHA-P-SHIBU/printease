import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";   // <-- THIS is correct place

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/:role/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;