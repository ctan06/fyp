import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignIn.css";

/*
  SignIn component

  This component is RESPONSIBLE ONLY for:
  - displaying the sign-in UI
  - triggering a login action when the form is submitted

  It does NOT verify credentials (no backend yet).
  Instead, it SIMULATES a successful login.

  Props:
  - onLogin: function passed from App.js
    → updates authentication state globally
*/

const SignIn = ({ onLogin }) => {
   /*
    useNavigate allows us to programmatically redirect the user
    after a successful sign-in (instead of clicking a link)
  */
const navigate = useNavigate();

  /*
    This function runs when the user submits the form.
    For now, we assume login is always successful.
  */
const handleSubmit = (e) => {
  e.preventDefault(); // 🔹 Prevent page refresh (VERY important in React)

    /*
      TEMPORARY AUTHENTICATION LOGIC

      Since we do not have:
      - a database
      - a backend
      - real authentication

      We simulate a successful login by:
      1. Calling onLogin() → updates isAuthenticated = true
      2. Redirecting the user to the dashboard
    */
  onLogin();
  navigate("/dashboard");
};

  return (
    <div className="signin-container">
      <div className="signin-flex">

        {/* Left side text */}
        <div className="signin-left">
          <h1>Welcome Back! We've missed you.</h1>
          <p>Sign in to your account to manage your connections, stay updated, and 
            make the most of your dashboard. Your network is just a click away.</p>
        </div>

        {/* Right side form */}
        <div className="signin-card">

          {/* Header */}
          <div className="signin-header">
            <h2>Ready to Connect?</h2>
            <p>Sign in to access your network dashboard</p>
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />

            <div className="signin-options">
              <a href="/forgot-password" className="forgot">Forgot password?</a>
            </div>

            <button type="submit" className="btn-signin">Sign In</button>
          </form>

          {/* Sign Up Link */}
          <div className="signup-prompt">
            <p>
              Don’t have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignIn;
