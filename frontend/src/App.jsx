import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";

import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import About from "./Components/About";
import Features from "./Components/Features";
import HowItWorks from "./Components/HowItWorks";
import Footer from "./Components/Footer";
import SignIn from "./Pages/SignIn";
import SignInNavbar from "./Components/SignInNavbar";
import SignUp from "./Pages/SignUp";
import ForgotPassword from "./Pages/ForgotPassword";
import Dashboard from "./Pages/Dashboard";

const App = () => {

  // This state represents whether the user is authenticated or not.
  // It is initialized using localStorage so that the login state
  // persists even after a page refresh.
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  // This function is called after a successful login.
  // It updates localStorage to persist authentication
  // and updates React state to trigger a re-render.
  const login = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  // This function logs the user out by removing the authentication
  // flag from localStorage and updating the state.
  // Once called, the UI automatically updates to the non-authenticated view.
  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <Router>

      <Routes>
        {/* Main Home Page */}
        <Route
          path="/"
          element={
            <>
              {/* 
              Navbar receives authentication state and logout function.
              It is responsible for deciding whether to show "Sign In" or "Log Out".
              */}
              <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />

              <section id="home"> {/*the id = home lets te navbar scroll to it*/}
                <Hero /> {/* Show the hero section */}
              </section>

              <section id="about">
                <About />
              </section>

              <section id="features">
                <Features />
              </section>

              <section id="how-it-works">
                <HowItWorks />
              </section>

            </>
          }
        />

        <Route path="/signin" element={
          !isAuthenticated ? (
            <>
            <SignInNavbar />
            <SignIn onLogin={login} />
            </>
          ) : (
            <Navigate to="/dashboard" />
          )
        }
        />


        <Route path="/signup" element={
          !isAuthenticated ? (
          <>
          <SignInNavbar />
          <SignUp />
          </>
        ) : (
          <Navigate to="/" />
        )
        }
        />

          <Route path="/forgot-password" element={
          !isAuthenticated ? (
          <>
            <SignInNavbar />
            <ForgotPassword />
          </>
          ) : (
            <Navigate to="/" />
          )
          }
          />

        <Route path="/dashboard" element={
          isAuthenticated ? (
          <>
            <SignInNavbar />
            <Dashboard />
          </>
          ) : (
            <Navigate to="/signin" />
          )
        }
        />          

      </Routes>
      <Footer />

    </Router>
  );
};

export default App;
