import React from "react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Provide Configuration",
      description:
        "Upload or select the network configuration you want to analyze."
    },
    {
      step: "2",
      title: "Automated Validation",
      description:
        "The system analyzes routing, interfaces, protocols, and security rules."
    },
    {
      step: "3",
      title: "Issue Detection",
      description:
        "Misconfigurations, risks, and compliance issues are identified."
    },
    {
      step: "4",
      title: "Detailed Report",
      description:
        "Receive a structured report with insights and recommendations."
    }
  ];

  return (
    <section className="how-section-alt" id="how-it-works">
      <div className="how-header">
        <span className="how-subtitle">How It Works</span>
        <h2 className="how-title">From Configuration to Insight</h2>
      </div>

      <div className="timeline">
        {steps.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-step">{item.step}</div>
            <div className="timeline-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
