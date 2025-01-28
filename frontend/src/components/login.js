import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing error
    setSuccess(""); // Clear any existing success message

    // Simple validation
    if (!email || !password) {
      setError("Email and Password are required.");
      return;
    }

    try {
      // Make the login request
      const response = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });

      // Check for the token in the response
      if (response.data.token) {
        console.log("Token received:", response.data.token); // Debug log to verify token
        setSuccess("Login successful!");
        localStorage.setItem("token", response.data.token); // Store the token in local storage
        console.log("Token saved to localStorage:", localStorage.getItem("token")); // Verify storage
        
        if (response.data.has_diet_plan) {
          // Redirect to diet plan display
          navigate("/dietPlan");
        } else {
          // Redirect to diet preference form
          navigate("/diet-preference-form");
        }
      } else {
        console.error("No token received from the backend.");
        setError("Login failed. No token received.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data?.detail || err.message); // Log error details
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        {success && <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>}
        <button type="submit" style={{ padding: "10px", width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
