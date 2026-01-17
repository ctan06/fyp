import React from "react";
import { Link } from "react-router-dom";
import './SignInNavbar.css';
import logo from '../assets/nav-logo.jpeg';


const SignInNavbar = () => {
  return (
    <nav className="container">
        <img src={logo} alt="Logo" className='logo'/>
        <ul>
            <li>
                <Link to="/" className="btn">Home</Link>
            </li>
        </ul>
    </nav>
  );
};

export default SignInNavbar;
