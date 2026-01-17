import React from "react";
import { Link } from "react-router-dom";
import "./SignIn.css";

const SignIn = () => {
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
          <form className="signin-form">
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
