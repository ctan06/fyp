import React from "react";
import "./RouterConfigModal.css";

const RouterConfigModal = ({ router, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{router.name} Configuration</h2>

        <ul>
          <li><strong>IP Address:</strong> {router.ip}</li>
          <li><strong>Subnet Mask:</strong> {router.subnet}</li>
          <li><strong>Default Gateway:</strong> {router.gateway}</li>
          <li><strong>DNS Server:</strong> {router.dns}</li>
        </ul>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RouterConfigModal;
