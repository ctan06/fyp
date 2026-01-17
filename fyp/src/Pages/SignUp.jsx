import React from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";

const SignUp = () => {
  return (
    <div className="signup-container">
      <div className="signup-flex">

        {/* Left side text */}
        <div className="signup-left">
          <h1>Join Our Network!</h1>
          <p>
            Create your account to manage your connections, stay updated, and unlock the full potential 
            of your dashboard. Start growing your professional network today.
          </p>
        </div>

        {/* Right side form */}
        <div className="signup-card">

          {/* Header */}
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Fill in the information below to get started</p>
          </div>

          {/* Form */}
          <form className="signup-form">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" id="fullname" placeholder="Enter your full name" required />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" required />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" placeholder="Confirm your password" required />

            <button type="submit" className="btn-signup">Sign Up</button>
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

export default SignUp;
