import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests from "./pages/AdminRequests";
import Printout from "./pages/Printout";
import SubmitPrintRequest from "./pages/SubmitPrintRequest";
import PaymentPage from './pages/PaymentPage';
import PrintStatus from './pages/PrintStatus';
import PreviousActivity from './pages/PreviousActivity';

// ── Bookstore ──
import Bookstore from "./pages/Bookstore";
import BookstoreItems from "./pages/BookstoreItems";
import BookstoreCart from "./pages/BookstoreCart";
import BookstorePayment from "./pages/BookstorePayment";
import BookstoreSuccess from "./pages/BookstoreSuccess";
import BookstoreStatus from "./pages/BookstoreStatus";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/:role/dashboard" element={<Dashboard />} />
        <Route path="/:role/printout" element={<Printout />} />
        <Route path="/:role/printout/submit" element={<SubmitPrintRequest />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/:role/printout/status" element={<PrintStatus />} />
        <Route path="/:role/printout/history" element={<PreviousActivity />} />

        {/* ── Bookstore ── */}
        <Route path="/:role/bookstore" element={<Bookstore />} />
        <Route path="/:role/bookstore/items" element={<BookstoreItems />} />
        <Route path="/:role/bookstore/cart" element={<BookstoreCart />} />
        <Route path="/:role/bookstore/payment" element={<BookstorePayment />} />
        <Route path="/:role/bookstore/success" element={<BookstoreSuccess />} />
        <Route path="/:role/bookstore/status" element={<BookstoreStatus />} />

      </Routes>
    </Router>
  );
}

export default App;