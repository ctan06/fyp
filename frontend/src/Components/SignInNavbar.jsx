import React from "react";
import { Link } from "react-router-dom";
import './SignInNavbar.css';
import logo from '../assets/nav-logo.jpeg';


const SignInNavbar = () => {
  return (
    <nav>
      <img src={logo} alt="Logo" className="logo" />

      <div className="nav-right">
        <Link to="/" className="btn">Home</Link>
      </div>
    </nav>
  );
};

export default SignInNavbar;
