import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <h3>NetConfig Checker</h3>
          <p>
            A professional tool for validating network configurations,
            detecting misconfigurations, and improving security.
          </p>
        </div>

        {/* Navigation */}
        <div className="footer-links">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#security">Security</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-links">
          <h4>Resources</h4>
          <ul>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} NetConfig Checker. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
