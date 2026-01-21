import React, { useState } from "react";
import "./RouterConfigModal.css";

const RouterConfigModal = ({ router, onClose }) => {
  const [config, setConfig] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRunningConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/run-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch configuration");
      }

      setConfig(data.output);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{router.name}</h2>

        <p><strong>IP:</strong> {router.ip}</p>
        <p><strong>Status:</strong> {router.status}</p>

        <button
          className="fetch-config-btn"
          onClick={fetchRunningConfig}
          disabled={loading}
        >
          {loading ? "Fetching..." : "View Running Configuration"}
        </button>

        {error && <p className="error">{error}</p>}

        {config && (
          <pre className="config-output">
            {config}
          </pre>
        )}

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default RouterConfigModal;
