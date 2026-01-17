import React from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  return (
    <div className="forgot-container">
      <div className="forgot-flex">

        {/* Left side text */}
        <div className="forgot-left">
          <h1>Forgot Your Password?</h1>
          <p>
            No worries! Enter your email below and we’ll send you a link to reset your password.
            You’ll be back into your dashboard in no time.
          </p>
        </div>

        {/* Right side form */}
        <div className="forgot-card">

          {/* Header */}
          <div className="forgot-header">
            <h2>Reset Password</h2>
            <p>Enter your registered email to receive a reset link</p>
          </div>

          {/* Form */}
          <form className="forgot-form">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />

            <button type="submit" className="btn-forgot">
              Send Reset Link
            </button>
          </form>

          {/* Sign In Link */}
          <div className="signin-prompt">
            <p>
              Already have an account? <Link to="/signin" className="signin-link">Sign In</Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
