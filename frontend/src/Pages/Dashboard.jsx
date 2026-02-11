import React, { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [routers, setRouters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [routerName, setRouterName] = useState("");
  const [routerIP, setRouterIP] = useState("");
  const [error, setError] = useState("");

  const validateIP = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/.replace(/\s+/g, "");

    return ipRegex.test(ip);
  };

  const handleAddRouter = (e) => {
    e.preventDefault();

    if (!routerName || !routerIP) {
      setError("All fields are required.");
      return;
    }

    if (!validateIP(routerIP)) {
      setError("Invalid IP format. Use x.y.z.w (0-255)");
      return;
    }

    const newRouter = {
      id: Date.now(),
      name: routerName,
      ip: routerIP,
    };

    setRouters([...routers, newRouter]);
    setRouterName("");
    setRouterIP("");
    setError("");
    setShowForm(false);
  };

  return (
    <div className="dashboard-container">
      <h1>Network Dashboard</h1>

      <button
        className="add-router-btn"
        onClick={() => setShowForm(true)}
      >
        + Add Router
      </button>

      {routers.length > 0 && (
        <div className="router-list">
          {routers.map((router) => (
            <div key={router.id} className="router-card">
              <h3>{router.name}</h3>
              <p>{router.ip}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Router</h2>

            <form onSubmit={handleAddRouter}>
              <input
                type="text"
                placeholder="Router Name (e.g. R1)"
                value={routerName}
                onChange={(e) => setRouterName(e.target.value)}
              />

              <input
                type="text"
                placeholder="IP Address (e.g. 192.168.1.1)"
                value={routerIP}
                onChange={(e) => setRouterIP(e.target.value)}
              />

              {error && <p className="error">{error}</p>}

              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  Save
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
