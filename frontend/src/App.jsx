import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
  return (
    <Router>

      <Routes>
        {/* Main Home Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />

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

        {/* Sign In Page */}
        <Route 
          path="/signin" element={
          <>
          <SignInNavbar/>
          <SignIn />
          </>} />

        {/*Sign Up Page*/}
        <Route path="/signup" element={
          <>
          <SignInNavbar/>
          <SignUp />
          </>} />
        
        <Route 
          path ="/forgot-password" element={
            <>
            <SignInNavbar/>
            <ForgotPassword/>
            </>
          } />

        <Route path="/dashboard" element={
          <>
          <SignInNavbar/>
          <Dashboard />
          </>
          } />

      </Routes>
      <Footer />

    </Router>
  );
};

export default App;
