import React from 'react'
import './Hero.css'
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className='hero container'> 
        <div className='hero-text'>
          <h1>Check Your Network Configuration Instantly</h1>
          <p>Monitor and verify the settings of all your routers in real time. 
            Our platform ensures that every device in your network complies with industry 
            standards, highlights misconfigurations, and gives you actionable insights — all 
            from a single, easy-to-use dashboard.</p>
            <Link to="/signin">
              <button className='btn'>Check Your Network</button>
            </Link>
        </div>
    </div>
  )
}

export default Hero