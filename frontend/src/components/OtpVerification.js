import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/OtpVerification.css";

const OtpVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/auth/verify-otp", { email, otp });
            setMessage("Account verified successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.detail || "OTP verification failed.");
        }
    };

    return (
        <div className="otp-container">
            <h2>OTP Verification</h2>
            <p>Please enter the OTP sent to: <strong>{email}</strong></p>
            <form onSubmit={handleOtpVerification}>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button type="submit">Verify OTP</button>
            </form>
            {message && <p className={`message ${message.includes("failed") ? "error" : ""}`}>{message}</p>}
        </div>
    );
};

export default OtpVerification;
