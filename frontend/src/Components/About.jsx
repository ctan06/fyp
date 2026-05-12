import React from 'react'
import './About.css'
import about_img from '../assets/Blue-logo.png'
const About = () => {
  return (
    <div className='about'>
        <div className="about-left">
            <img src={about_img} alt="" className='about-img'/>
        </div>
        <div className="about-right">
            <h3>ABOUT US</h3>
            <h2>Building Confidence in Network Configuration</h2>
            <p>
                Network Configuration Checker is a web-based platform designed to help organizations monitor and 
                validate their network configurations with ease. By analyzing router settings 
                against predefined standards, we help identify misconfigurations and ensure network 
                reliability and security.
            </p>
            <p>
                Developed as a final year computer science project, Network Configuration Checker focuses on clarity, 
                accuracy, and scalability. Our goal is to simplify network compliance checks and 
                provide actionable insights that empower users to maintain robust and 
                well-configured networks.
            </p>

        </div>
        
    </div>
  )
}

export default About