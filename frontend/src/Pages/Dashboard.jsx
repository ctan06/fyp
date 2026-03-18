import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [routers, setRouters] = useState([]); //stored routers currently displayed in UI
  const [showForm, setShowForm] = useState(false); //controls visibility of the add router form 
  const [routerName, setRouterName] = useState(""); //stores the name of the router being added
  const [routerIP, setRouterIP] = useState(""); //stores the IP address of the router being added
  const [error, setError] = useState(""); //stores any error messages related to form validation or backend errors
  //View configuration states
  const [selectedConfig, setSelectedConfig] = useState(null); //stores the configuration data of the selected router for viewing
  //Fetch configuration loading states
  const [fetchingRouterId, setFetchingRouterId] = useState(null); //stores the ID of the router currently being fetched for configuration (used to show loading state)
  const [fetchMessages, setFetchMessages] = useState({}); //stores messages related to fetching configuration for each router (e.g. success or error messages)
  // Fetch ALL configurations states
  const [fetchAllLoading, setFetchAllLoading] = useState(false);
  const [fetchAllResult, setFetchAllResult] = useState(null);
  // History modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false); // controls history modal visibility
  const [historyConfigs, setHistoryConfigs] = useState([]); // stores all configs for selected router
  const [loadingHistoryRouterId, setLoadingHistoryRouterId] = useState(null); // loading state for history fetch
  const [selectedHistoryConfig, setSelectedHistoryConfig] = useState(null); // stores selected config from history to view in modal

  // Fetch routers from backend when Dashboard mounts
  useEffect(() => {
    const fetchRouters = async () => {
      try {
        //JWT Authorization token
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:8000/routers/all", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch routers");

        //convert JSON response from backend into JavaScript object
        const routersFromBackend = await response.json();
        setRouters(routersFromBackend);
      } catch (err) {
        console.error("Error fetching routers:", err);
      }
    };

    //immediately invoke the function to fetch routers when the component (dashboard) mounts
    fetchRouters();
  }, []);

  const validateIP = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

    return ipRegex.test(ip);
  };

  //This is the function that checks for empty fields and validates the IP address format 
  // before adding a new router to the list.
  const handleAddRouter = async (e) => {
    e.preventDefault(); // Prevent default form submission (page refresh)

    if (!routerName || !routerIP) {
      setError("All fields are required."); //ensure user entered both fields
      return;
    }

    if (!validateIP(routerIP)) {
      setError("Invalid IP format. Use x.y.z.w (0-255)"); //ensure user entered a valid IP address format
      return;
    }

    try {
      //fetch request to backend to add new router
      const response = await fetch("http://localhost:8000/routers/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT included for authentication
        },
        body: JSON.stringify({
          name: routerName,
          ip: routerIP,
        }),
      });

      // Handle backend errors
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to add router");
      }

      // Update frontend state with backend response (shows newly added routers)
      const newRouterFromBackend = await response.json();
      setRouters([...routers, newRouterFromBackend]);

      // Reset form and close modal
      setRouterName("");
      setRouterIP("");
      setError("");
      setShowForm(false);
    }
    //catch any errors (backend + network) 
    catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  //This function deletes router from backend and updates frontend state to remove the deleted router.
  const handleDeleteRouter = async (routerId) => {
    try {
      //Retrieve JWT token from localStorage for authentication.
      const token = localStorage.getItem("token");
      if (!token) return;

      //Send DELETE request to backend to delete the router with the specified ID.
      const response = await fetch(
        `http://localhost:8000/routers/${routerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //Handle backend errors
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to delete router");
      }

      //If deletion is successful, update frontend state
      setRouters((prevRouters) =>
        prevRouters.filter((router) => router.id !== routerId)
      );

    } catch (err) {
      console.error("Error deleting router:", err);
      setError(err.message);
    }
  };

  // This function fetches the latest configuration for a specific router and displays it in a modal.
  const handleViewConfiguration = async (routerId) => {
    try {
      // Get JWT token
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optional: clear previous error
      setError("");

      // Fetch latest config from new backend route
      const response = await fetch(
        `http://localhost:8000/ansible/router/${routerId}/latest-config`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch latest configuration");
      }

      const data = await response.json();

      // Set the selected config state for the modal
      setSelectedConfig({
        router_id: data.router_id,
        version: data.version,
        config: data.config,
        created_at: data.created_at,
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // This function triggers the backend to fetch the latest configuration for a specific router.
  const handleFetchConfiguration = async (routerId) => {
    try {
      //Retrieve JWT token for authentication
      const token = localStorage.getItem("token");
      if (!token) return;

      // Set loading state for this specific router
      setFetchingRouterId(routerId);
      setError("");

      //Send POST request to backend to fetch the latest configuration for the specified router ID.
      const response = await fetch(
        `http://localhost:8000/ansible/fetch-config/${routerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT included for authentication
          },
        }
      );

      //Handle backend errors
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch configuration");
      }

      //Parse the response from the backend to check if the configuration was updated and 
      // to get the new version number.
      const result = await response.json();

      // Check whether configuration changed or not
      if (result.changed) {
        // If configuration changed, store success message for this specific router
        setFetchMessages((prev) => ({
          ...prev, // keep previous router messages
          [routerId]: `New configuration detected! Version ${result.data.version} saved.`, // show new version in message to provide feedback to user
        }));
      } else {
        // If no changes detected, store informational message
        setFetchMessages((prev) => ({
          ...prev,
          [routerId]: `No new updates. Current version is ${result.data.version}.`, // show current version even if no changes to provide feedback to user
        }));
      }

      // Optional: Automatically remove the message after 5 seconds
      setTimeout(() => {
        setFetchMessages((prev) => {
          const updated = { ...prev };
          delete updated[routerId]; // remove only this router's message
          return updated;
        });
      }, 5000);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setFetchingRouterId(null); // stop loading
    }
  };

  // Fetch configurations for ALL routers
  const handleFetchAllConfigurations = async () => {
    try {
      //Retrieve JWT token for authentication
      const token = localStorage.getItem("token");
      if (!token) return;

      // Set loading state and clear previous results/errors
      setFetchAllLoading(true);
      setFetchAllResult(null);
      setError("");

      //Send POST request to backend to fetch latest configurations for all routers.
      const response = await fetch(
        "http://localhost:8000/ansible/fetch-all-configs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT included for authentication
          },
        }
      );

      //Handle backend errors
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch all configurations");
      }

      //Parse the response from the backend which should include lists of which routers were updated,
      // skipped, or failed during the fetch process.
      const result = await response.json();

      // Store the result in state to display in the UI
      setFetchAllResult(result);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setFetchAllLoading(false);
    }
  };

  // Fetch all config versions for a router (GET /router/{router_id}/configs)
  const handleViewHistory = async (routerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingHistoryRouterId(routerId);
      setShowHistoryModal(true);

      const res = await fetch(
        `http://localhost:8000/ansible/router/${routerId}/configs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch router history");

      const configs = await res.json();
      setHistoryConfigs(configs);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingHistoryRouterId(null);
    }
  };

  // View a specific config version (GET /view-config/{config_id})
  const handleViewConfigVersion = async (configId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `http://localhost:8000/ansible/view-config/${configId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch config version");

      const data = await res.json();

      // Set the selected history config to view in the modal
      setSelectedHistoryConfig({
        name: data.router_name,
        ip: data.router_ip,
        config: data.config,
        version: data.version,
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Network Dashboard</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className="add-router-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Router
        </button>

        <button
          className="fetchAll-config-btn"
          onClick={handleFetchAllConfigurations}
          disabled={fetchAllLoading}
        >
          {fetchAllLoading ? "Fetching All..." : "Fetch All Configurations"}
        </button>
      </div>
        {fetchAllResult && (
          <div className="fetch-all-result">
            <h3>Fetch All Results</h3>

            <p><strong>Updated:</strong> {fetchAllResult.updated.join(", ") || "None"}</p>
            <p><strong>Skipped:</strong> {fetchAllResult.skipped.join(", ") || "None"}</p>
            <p><strong>Failed:</strong> {fetchAllResult.failed.join(", ") || "None"}</p>
          </div>
        )}

      {routers.length > 0 && (
        <div className="router-list">
          {routers.map((router) => (
            <div key={router.id} className="router-card">
              <h3>{router.name}</h3>
              <p>IP: {router.ip}</p>
              <div className="router-buttons">
                
                <button
                  className="fetch-config-btn"
                  onClick={() => handleFetchConfiguration(router.id)}
                  disabled={fetchingRouterId === router.id}
                >
                  {fetchingRouterId === router.id
                    ? "Fetching..."
                    : "Fetch Configuration"}
                </button>

                <button
                  className="view-config-btn"
                  onClick={() => handleViewConfiguration(router.id)}
                >
                  View Configuration
                </button>

                <button
                  className="view-history-btn"
                  onClick={() => handleViewHistory(router.id)}
                  disabled={loadingHistoryRouterId === router.id}
                >
                  {loadingHistoryRouterId === router.id ? "Loading History..." : "View History"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteRouter(router.id)}
                >
                  Delete
                </button>
              </div>
              
              {/* Display fetch result message for this router (if exists) */}
              {fetchMessages[router.id] && (
                <p className="fetch-message">
                  {fetchMessages[router.id]}
                </p>
              )}
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
                  className="add-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedConfig && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Router Configuration</h2>

            <p><strong>Version:</strong> {selectedConfig.version}</p>
            <p><strong>Fetched At:</strong> {new Date(selectedConfig.created_at).toLocaleString()}</p>

            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                backgroundColor: "#1e1e1e",
                color: "#00ff88",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflowY: "scroll",
                borderRadius: "8px"
              }}
            >
              {selectedConfig.config}
            </div>

            <div className="modal-buttons">
              <button
                className="view-cancel-btn"
                onClick={() => setSelectedConfig(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="history-modal-overlay">
          <div className="history-modal">
            <h2>Config History</h2>
            {historyConfigs.length === 0 ? (
              <p>No history available.</p>
            ) : (
              <div className="history-list">
                {historyConfigs.map((cfg) => (
                  <div key={cfg.id} className="history-item">
                    <p>
                      <strong>Version:</strong> {cfg.version} |{" "}
                      <strong>Fetched At:</strong> {new Date(cfg.created_at).toLocaleString()}
                    </p>
                    <button
                      className="view-configVersion-btn"
                      onClick={() => handleViewConfigVersion(cfg.id)}
                    >
                      View Config
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              className="history-close-btn"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedHistoryConfig && (
        <div className="history-modal-overlay">
          <div className="modal">
            <h2>Configuration Version: {selectedHistoryConfig.version}</h2>

            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                backgroundColor: "#1e1e1e",
                color: "#00ff88",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflowY: "scroll",
                borderRadius: "8px"
              }}
            >
              {selectedHistoryConfig.config}
            </div>

            <div className="modal-buttons">
              <button
                className="view-cancel-btn"
                onClick={() => setSelectedHistoryConfig(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
