import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE from "../api";
import "./SignIn.css";

/*
  SignIn component

  - Display the sign-in UI
  - Collect user credentials (email & password)
  - Send credentials to the backend for authentication
  - If authentication succeeds:
      → store the JWT token via onLogin(token)
      → redirect the user to the dashboard
*/

const SignIn = ({ onLogin }) => {
  /*
    Local component state:
    These states store user input and UI feedback.
  */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

   /*
    useNavigate allows us to programmatically redirect the user
    after a successful sign-in (instead of clicking a link)
  */
const navigate = useNavigate();

  /*
    This function runs when the user submits the form.
    It sends credentials to the backend and handles the response.
  */
const handleSubmit = async (e) => {
  e.preventDefault(); // 🔹 Prevent page refresh (VERY important in React)

    try {
      // Send login request to FastAPI backend
      const response = await fetchWithNgrok(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // If credentials are incorrect, backend returns 401
      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      // Parse backend response
      const data = await response.json();

      /*
        Backend returns:
        {
          access_token: "...",
          token_type: "bearer"
        }

        We pass the token to App.jsx via onLogin(token)
      */
      onLogin({
        token: data.access_token,
        user: data.user
      });

      // Redirect authenticated user to dashboard
      navigate("/dashboard");

    } catch (err) {
      // Display error message in UI
      setError(err.message);
    }
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
            <input type="email" id="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)}required />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />

            <div className="signin-options">
              <a href="/forgot-password" className="forgot">Forgot password?</a>
            </div>

            <button type="submit" className="btn-signin">Sign In</button>

            {/* Display backend error message */}
            {error && <p className="signin-error">{error}</p>}
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
