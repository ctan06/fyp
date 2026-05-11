import React, { useState } from 'react';
import { Link } from "react-router-dom";
import './Navbar.css';
import logo from '../assets/nav-logo.jpeg';

/*
  Navbar component

  This component is now "authentication-aware".
  It does NOT decide who is logged in by itself.
  Instead, it RECEIVES information from App.js.

  Props:
  - isAuthenticated: boolean → tells us if the user is logged in
  - onLogout: function → called when the user clicks "Log Out"
*/

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className='container'>
        <img src={logo} alt="Logo" className='logo'/>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={menuOpen ? "active" : ""}>
            <li onClick={closeMenu}><a href="#home">Home</a></li>
            <li onClick={closeMenu}><a href="#about">About Us</a></li>
            <li onClick={closeMenu}><a href="#features">Features</a></li>
            <li onClick={closeMenu}><a href="#how-it-works">How It Works</a></li>
            {/* 
            AUTHENTICATION-BASED RENDERING

            We conditionally render ONE of two buttons:
            - If the user is NOT logged in → show "Sign In"
            - If the user IS logged in → show "Log Out"

            This is controlled by the `isAuthenticated` boolean.
            */}
            <li onClick={closeMenu}>
              {!isAuthenticated ? (
              /*
                Case 1: User is NOT authenticated

                We show a "Sign In" button that navigates
                to the /signin route using React Router.
              */
              <Link to="/signin" className="btn">
                Sign In
              </Link>
              ) : (
              /*
                Case 2: User IS authenticated

                We show a "Log Out" button.
                This is NOT a Link because logging out
                is an ACTION, not navigation.

                When clicked:
                - onLogout() is called
                - Authentication state is reset in App.js
                - Navbar re-renders automatically
              */
              <button className="btn" onClick={onLogout}>
                Log Out
              </button>
              )}
            </li>
          </ul>
    </nav>
  )
}

export default Navbar;
