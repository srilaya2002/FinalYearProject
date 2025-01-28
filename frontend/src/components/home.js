import React from "react";
import "../style/home.css";
import logo from "../images/logo.png"; 

const Home = () => {
    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="logo">
                <img src={logo} alt="NutriMate Logo" />
                    <span>NutriMate</span>
                </div>
                <div className="nav-links">
                    <a href="/signup" className="signup-link">Sign Up for Free</a>
                    <a href="/login" className="login-link">Login</a>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <p>Where cutting-edge AI meets your unique nutrition needs,
                    <br/>empowering you with personalised meal plans and smarter eating solutions.</p>
            </main>

            {/* Footer */}
            <footer className="footer">
            <a href="/signup" className="signup-link">Sign Up for Free</a>
            <a href="/login" className="login-link">Login</a>
            <a href="/instagram" className="login-link">Instagram</a>
            <a href="/instagram" className="login-link">Facebook</a>
                <p>&copy; 2025 NutriMate. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
