import React, { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [routers, setRouters] = useState([]); //stored routers currently displayed in UI
  const [showForm, setShowForm] = useState(false); //controls visibility of the add router form 
  const [routerName, setRouterName] = useState(""); //stores the name of the router being added
  const [routerIP, setRouterIP] = useState(""); //stores the IP address of the router being added
  const [error, setError] = useState(""); //stores any error messages related to form validation or backend errors

  const validateIP = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

    return ipRegex.test(ip);
  };

  //This is the function that checks for empty fields and validates the IP address format 
  // before adding a new router to the list.
  //If there are any errors, it sets an error message that is displayed to the user.
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

      // Update frontend state with backend response
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
