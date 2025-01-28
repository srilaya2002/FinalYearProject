import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/signup.css";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/auth/signup", { email, password });
            setMessage("Signup successful! Please verify your email.");
            setTimeout(() => {
                navigate("/otp-verification", { state: { email } });
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.detail || "Signup failed. Please try again.");
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p className={`message ${message.includes("failed") ? "error" : ""}`}>{message}</p>}
        </div>
    );
};

export default Signup;
