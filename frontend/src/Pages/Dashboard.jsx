import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import API_BASE from "../api";

const Dashboard = () => {
  const [routers, setRouters] = useState([]); //stored routers currently displayed in UI
  const [showForm, setShowForm] = useState(false); //controls visibility of the add router form 
  const [routerName, setRouterName] = useState(""); //stores the name of the router being added
  const [routerIP, setRouterIP] = useState(""); //stores the IP address of the router being added
  const [error, setError] = useState(""); //stores any error messages related to form validation or backend errors
  //View configuration states
  const [selectedConfig, setSelectedConfig] = useState(null); //stores the configuration data of the selected router for viewing
  const [noConfigMessages, setNoConfigMessages] = useState({}); //stores messages for routers that have no configuration available
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
  const [compareV1, setCompareV1] = useState("");
  const [compareV2, setCompareV2] = useState("");
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  // Edit router states
  const [showEditForm, setShowEditForm] = useState(false); // controls edit form visibility
  const [editRouterId, setEditRouterId] = useState(null); // stores the ID of the router being edited
  const [editRouterName, setEditRouterName] = useState(""); // stores the new name for the router being edited
  const [editRouterIP, setEditRouterIP] = useState(""); // stores the new IP for the router being edited
  const [editLoading, setEditLoading] = useState(false); // stores the loading state for the edit operation
  // Manage config states
  const [manageConfigData, setManageConfigData] = useState(null); // stores the configuration data for the router being managed
  const [showManageModal, setShowManageModal] = useState(false); // controls manage config modal visibility
  const [loadingManage, setLoadingManage] = useState(false); // stores the loading state for the manage config operation
  const [managingRouterId, setManagingRouterId] = useState(null); // stores the ID of the router being managed
  const [savingConfig, setSavingConfig] = useState(false); // stores the loading state for saving the managed configuration
  // Fetch routers from backend when Dashboard mounts
  useEffect(() => {
    const fetchRouters = async () => {
      try {
        //JWT Authorization token
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE}/routers/all`, {
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
      const response = await fetch(`${API_BASE}/routers/add`, {
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
        `${API_BASE}/routers/${routerId}`,
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
        `${API_BASE}/ansible/router/${routerId}/latest-config`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle 404 specifically to show "no config" message
      if (response.status === 404) {
        setNoConfigMessages((prev) => ({
          ...prev,
          [routerId]: "No configuration yet. Please fetch to see configuration.",
        }));

        // Auto-remove message after 5 seconds
        setTimeout(() => {
          setNoConfigMessages((prev) => {
            const updated = { ...prev }; // create a copy of the previous state
            delete updated[routerId]; // remove the message for this specific router ID
            return updated;
          });
        }, 5000);

        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch latest configuration");
      }

      const data = await response.json();

      // Clear any "no config" message for this router if config is successfully fetched
      setNoConfigMessages((prev) => {
        const updated = { ...prev };
        delete updated[routerId];
        return updated;
      });

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
        `${API_BASE}/ansible/fetch-config/${routerId}`,
        {
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
        `${API_BASE}/ansible/fetch-all-configs`,
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
        `${API_BASE}/ansible/router/${routerId}/configs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch router history");

      const configs = await res.json();

      setHistoryConfigs(
        configs.map(cfg => ({
          ...cfg,
          router_id: routerId
        }))
      );

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
        `${API_BASE}/ansible/view-config/${configId}`,
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

  const handleCompareConfigs = async (routerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!compareV1 || !compareV2) {
        setError("Please enter both version numbers.");
        return;
      }

      setCompareLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/ansible/router/${routerId}/compare?v1=${compareV1}&v2=${compareV2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Comparison failed");
      }

      const data = await res.json();

      setCompareResult(data);

      setCompareV1("");
      setCompareV2("");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCompareLoading(false);
    }
  };

  // This function is called when the user clicks the "Edit" button for a specific router.
  const handleOpenEdit = (router) => {
    setEditRouterId(router.id); // store the ID of the router being edited
    setEditRouterName(router.name); // pre-fill the name field with the current router name
    setEditRouterIP(router.ip); // pre-fill the IP field with the current router IP
    setShowEditForm(true); // show the edit form modal
    setError("");
  };

  // This function handles the submission of the edit router form.
  // It validates the input, sends a PATCH request to the backend to update the router,
  // and updates the frontend state with the new router information if successful.
  const handleEditRouter = async (e) => {
    e.preventDefault();

    if (!editRouterName || !editRouterIP) { //check for empty fields
      setError("All fields are required.");
      return;
    }

    if (!validateIP(editRouterIP)) { //validate IP address format
      setError("Invalid IP format.");
      return;
    }

    try {
      setEditLoading(true);

      const token = localStorage.getItem("token"); //get JWT token for authentication

      const response = await fetch(
        `${API_BASE}/routers/${editRouterId}`, //send PATCH request to update the router with the specified ID
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT included for authentication
          },
          body: JSON.stringify({ //send the updated name and IP in the request body
            name: editRouterName,
            ip: editRouterIP,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update router");
      }

      const updatedRouter = await response.json(); //get the updated router data from the backend response

      // Update the frontend state by mapping through the existing routers and replacing the edited router with the updated data from the backend
      setRouters((prevRouters) =>
        prevRouters.map((r) =>
          r.id === editRouterId ? updatedRouter : r
        )
      );

      // Reset edit form state and close the modal
      setShowEditForm(false); 
      setEditRouterId(null);
      setEditRouterName("");
      setEditRouterIP("");
      setError("");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // This function handles the "Manage Config" functionality.
  const handleManageConfig = async (routerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setManagingRouterId(routerId);
      setLoadingManage(true);

      const response = await fetch(
        `${API_BASE}/router-configs/router/${routerId}/structured-config`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to fetch structured config");
      }

      const data = await response.json();

      // VERY IMPORTANT: store config only
      setManageConfigData(data.config);

      // open modal
      setShowManageModal(true);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingManage(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !managingRouterId) return;

      setSavingConfig(true);

      // Build payload exactly as backend expects
      const payload = {
        hostname: manageConfigData.hostname,
        interfaces: manageConfigData.interfaces.map((intf) => ({
          name: intf.name,
          ip: intf.ip,
          mask: intf.mask,
        })),
      };

      const response = await fetch(
        `${API_BASE}/router-configs/router/${managingRouterId}/apply-config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to apply config");
      }

      const result = await response.json();

      console.log("Config applied:", result);

      // close modal on success
      setShowManageModal(false);
      setManageConfigData(null);
      setManagingRouterId(null);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Network Dashboard</h1>

          <div className="auto-fetch-banner">
            We automatically fetch configurations every 30 minutes.  
            If you want to fetch now, click the “Fetch All Configurations” button.
          </div>

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
                  className="manage-config-btn"
                  onClick={() => handleManageConfig(router.id)}
                  disabled={managingRouterId === router.id}
                >
                  {managingRouterId === router.id ? "Loading..." : "Manage Config"}
                </button>

                <button
                  className="edit-btn"
                  onClick={() => handleOpenEdit(router)}
                >
                  Edit
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

              {/* Display "no config" message for this router (if exists) */}
              {noConfigMessages[router.id] && (
                <p className="no-config-message">
                  {noConfigMessages[router.id]}
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

      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Router</h2>

            <form onSubmit={handleEditRouter}>
              <input
                type="text"
                value={editRouterName}
                onChange={(e) => setEditRouterName(e.target.value)}
              />

              <input
                type="text"
                value={editRouterIP}
                onChange={(e) => setEditRouterIP(e.target.value)}
              />

              {error && <p className="error">{error}</p>}

              <div className="modal-buttons">
                <button type="submit" className="save-btn" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="add-cancel-btn"
                  onClick={() => setShowEditForm(false)}
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

            {historyConfigs.length >= 2 && (
              <div className="compare-section">
                <h2>Compare Versions</h2>

                <div className = "compare-row">
                  <div className="compare-inputs">
                    <input
                      type="number"
                      placeholder="Version #1"
                      value={compareV1}
                      onChange={(e) => setCompareV1(e.target.value)}
                      className="compare-input"
                    />

                    <input
                      type="number"
                      placeholder="Version #2"
                      value={compareV2}
                      onChange={(e) => setCompareV2(e.target.value)}
                      className="compare-input"
                    />
                  </div>

                  <button
                    className="compare-btn"
                    onClick={() => handleCompareConfigs(historyConfigs[0].router_id)}
                    disabled={compareLoading}
                  >
                    {compareLoading ? "Comparing..." : "Compare"}
                  </button>
                </div>
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

      {compareResult && (
        <div className="modal-overlay">
          <div className="modal compare-modal">
            <h2>
              Diff: Version {compareResult.version_1} vs {compareResult.version_2}
            </h2>

            <div
              className="diff-box"
              style={{
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflowY: "auto",
                backgroundColor: "#0d1117",
                padding: "10px",
                borderRadius: "8px"
              }}
            >
              {(() => {
                const changes = [];
                const diff = compareResult.diff;

                for (let i = 0; i < diff.length; i++) {
                  const current = diff[i];
                  const next = diff[i + 1];

                  // Pair: removed -> added (real change)
                  if (current.type === "removed" && next?.type === "added") {
                    changes.push(
                      <div key={i} style={{ marginBottom: "6px" }}>
                        <div style={{ color: "#f85149" }}>- {current.line}</div>
                        <div style={{ color: "#2ea043" }}>+ {next.line}</div>
                      </div>
                    );
                    i++; // skip next (already used)
                  }

                  // Only removed (deleted line)
                  else if (current.type === "removed") {
                    changes.push(
                      <div key={i} style={{ color: "#f85149" }}>
                        - {current.line}
                      </div>
                    );
                  }

                  // Only added (new line)
                  else if (current.type === "added") {
                    changes.push(
                      <div key={i} style={{ color: "#2ea043" }}>
                        + {current.line}
                      </div>
                    );
                  }
                }

                return changes.length > 0 ? changes : <p>No differences found.</p>;
              })()}
            </div>

            <button
              className="history-close-btn"
              onClick={() => setCompareResult(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showManageModal && manageConfigData && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Manage Configuration</h2>

            {loadingManage ? (
              <p>Loading...</p>
            ) : (
              <>
                {/* HOSTNAME */}
                <div className="manage-hostname">
                  <h3>Hostname</h3>
                  <input
                    type="text"
                    value={manageConfigData.hostname || ""}
                    onChange={(e) =>
                      setManageConfigData({
                        ...manageConfigData,
                        hostname: e.target.value,
                      })
                    }
                  />
                </div>

                {/* INTERFACES */}
                <div className="interface-block">
                  <h3>Interfaces</h3>

                  {manageConfigData.interfaces?.map((intf, index) => (
                    <div key={index}>

                    <div className="interface-header">
                      <p>{intf.name}</p>

                      <span className={`status-badge ${intf.status}`}>
                        {intf.status}
                      </span>
                    </div>

                      {/* IP */}
                      <input
                        type="text"
                        placeholder="IP"
                        value={intf.ip || ""}
                        onChange={(e) => {
                          const updated = [...manageConfigData.interfaces];
                          updated[index].ip = e.target.value;

                          setManageConfigData({
                            ...manageConfigData,
                            interfaces: updated,
                          });
                        }}
                      />

                      {/* SUBNET MASK (NEW) */}
                      <input
                        type="text"
                        placeholder="Subnet Mask"
                        value={intf.mask || ""}
                        onChange={(e) => {
                          const updated = [...manageConfigData.interfaces];
                          updated[index].mask = e.target.value;

                          setManageConfigData({
                            ...manageConfigData,
                            interfaces: updated,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="modal-buttons">
              <button
                className="manage-save-btn"
                onClick={handleSaveConfig}
                disabled={savingConfig}
              >
                {savingConfig ? "Saving..." : "Save"}
              </button>

              <button
                className="manage-close-button"
                onClick={() => setShowManageModal(false)}
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
