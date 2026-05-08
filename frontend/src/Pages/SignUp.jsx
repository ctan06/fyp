import React from "react";
import { Link } from "react-router-dom";
import API_BASE from "../api";
import "./SignUp.css";


const SignUp = () => {
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents page refresh

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // simple check
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Error creating account");
        return;
      }

      alert("Account created successfully!");
    } catch (error) {
      alert("Server error");
      console.error(error);
    }
  };

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
          <form className="signup-form" onSubmit={handleSubmit}>
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
