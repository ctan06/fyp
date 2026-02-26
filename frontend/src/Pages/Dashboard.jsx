import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [routers, setRouters] = useState([]); //stored routers currently displayed in UI
  const [showForm, setShowForm] = useState(false); //controls visibility of the add router form 
  const [routerName, setRouterName] = useState(""); //stores the name of the router being added
  const [routerIP, setRouterIP] = useState(""); //stores the IP address of the router being added
  const [error, setError] = useState(""); //stores any error messages related to form validation or backend errors
  const [selectedConfig, setSelectedConfig] = useState(null); //stores the configuration data of the selected router for viewing
  const [fetchingRouterId, setFetchingRouterId] = useState(null); //stores the ID of the router currently being fetched for configuration (used to show loading state)

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

  // This function retrieves the latest configuration for a specific router from 
  // the backend and logs it to the console.
    /**
   * Flow:
   * 1. Get the list of configs for the router (/router/{router_id}/configs)
   * 2. Take the first item (newest version)
   * 3. Fetch the full config using /view-config/{config_id}
   */
  const handleViewConfiguration = async (routerId) => {
    try {
      //Retrieve JWT token for authentication
      const token = localStorage.getItem("token");
      if (!token) return;

      //Get the list of configs for this router (latest first)
      const listResponse = await fetch(
        `http://localhost:8000/ansible/router/${routerId}/configs`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT included for authentication
          },
        }
      );

      //Handle backend errors
      if (!listResponse.ok) {
        const errData = await listResponse.json();
        throw new Error(errData.detail || "Failed to fetch router configs");
      }

      //Parse the list of configs from the response
      const configsList = await listResponse.json();

      //Check if there are any configs available for this router
      if (configsList.length === 0) {
        console.log("No configurations found for this router.");
        return;
      }

      //Take the newest config (first in the list)
      const newestConfigId = configsList[0].id;

      //Fetch the full configuration
      const configResponse = await fetch(
        `http://localhost:8000/ansible/view-config/${newestConfigId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT included for authentication
          },
        }
      );

      //Handle backend errors
      if (!configResponse.ok) {
        const errData = await configResponse.json();
        throw new Error(errData.detail || "Failed to fetch full configuration");
      }

      //Parse the configuration data from the response
      const configData = await configResponse.json();

      // Extract raw ansible output
      const rawOutput = configData.config;

      // Find JSON part inside ansible output
      const jsonStart = rawOutput.indexOf("{");
      const jsonEnd = rawOutput.lastIndexOf("}") + 1;

      // If we can't find a valid JSON object, throw an error
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not extract router data");
      }

      // Parse the JSON string to get structured data
      const jsonString = rawOutput.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonString);

      // Extract clean router data
      const routerName = parsed.router_data.name;
      const routerIP = parsed.router_data.ip;
      const routerConfig = parsed.router_data.config;

      // Save to state so UI can display it
      setSelectedConfig({
        name: routerName,
        ip: routerIP,
        config: routerConfig,
      });

    } catch (err) {
      console.error(err);
      setError(err.message); // Show error in UI
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

      // Show an alert to the user indicating whether the configuration was updated or 
      // if no changes were detected, along with the current version number.
      if (result.changed) {
        alert(`Configuration updated to version ${result.data.version}`);
      } else {
        alert(`No changes detected. Current version: ${result.data.version}`);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setFetchingRouterId(null); // stop loading
    }
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
                  className="delete-btn"
                  onClick={() => handleDeleteRouter(router.id)}
                >
                  Delete
                </button>
              </div>
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

            <p><strong>Name:</strong> {selectedConfig.name}</p>
            <p><strong>IP Address:</strong> {selectedConfig.ip}</p>

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
    </div>
  );
};

export default Dashboard;
