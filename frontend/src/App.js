import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Printout from "./pages/Printout";
import SubmitPrintRequest from "./pages/SubmitPrintRequest";
import "./App.css";

function App() {
  return ( 
  <Router>
     <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/:role/dashboard" element={<Dashboard />} />
      <Route path="/:role/printout" element={<Printout />} /> 
      <Route path="/:role/printout/submit" element={<SubmitPrintRequest />} />
     </Routes>
  </Router>
  );
 } 
 export default App;