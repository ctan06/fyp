import React from "react";
import "./RouterCard.css";

const RouterCard = ({ router, onView }) => {
  return (
    <div className="router-card">
      <h3>{router.name}</h3>
      <p><strong>Status:</strong> <span className="online">{router.status}</span></p>
      <p><strong>IP Address:</strong> {router.ip}</p>

      <button className="view-btn" onClick={onView}>
        View Configuration
      </button>
    </div>
  );
};

export default RouterCard;
