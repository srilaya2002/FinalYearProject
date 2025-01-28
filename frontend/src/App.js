import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/login";
import Signup from "./components/signup";
import OtpVerification from "./components/OtpVerification";
import DietPreferenceForm from "./components/dietPreference";
import DietPlanDisplay from "./components/dietPlan";
import ParentComponent from "./components/parentComponent"; // Import the ParentComponent

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/diet-preference-form" element={<DietPreferenceForm />} />
        <Route path="/dietPlan" element={<DietPlanDisplay />} />
        <Route path="/chat" element={<ParentComponent />} /> {/* Use ParentComponent */}
      </Routes>
    </Router>
  );
};

export default App;
