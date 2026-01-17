import React from 'react';
import { Link } from "react-router-dom";
import './Navbar.css';
import logo from '../assets/nav-logo.jpeg';

const Navbar = () => {
  return (
    <nav className='container'>
        <img src={logo} alt="Logo" className='logo'/>

        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li>
              <Link to="/signin" className='btn'>Sign In</Link>
            </li>
        </ul>
    </nav>
  )
}

export default Navbar;
