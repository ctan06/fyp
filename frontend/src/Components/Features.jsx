import React from 'react';
import './Features.css';

const Features = () => {
  const featuresList = [
    {
      title: "Real-Time Monitoring",
      description: "View live router configurations and monitor changes instantly.",
      icon: "📡"
    },
    {
      title: "Standards Compliance",
      description: "Verify network devices against industry standards automatically.",
      icon: "✅"
    },
    {
      title: "Actionable Insights",
      description: "Get recommendations and alerts for misconfigured devices.",
      icon: "⚡"
    },
    {
      title: "Multi-Network Support",
      description: "Manage multiple networks from a single, easy-to-use dashboard.",
      icon: "🌐"
    }
  ];

  return (
    <section className="features-section">
        <div className="features-header">
            <span className="features-subtitle">Our Features</span>
            <h2 className="features-title">What We Offer</h2>
        </div>

        <div className="features-container">
        {featuresList.map((feature, index) => (
            <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
            </div>
        ))}
        </div>
    </section>
  );
}

export default Features;