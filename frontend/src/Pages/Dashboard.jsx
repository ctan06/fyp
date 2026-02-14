import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [routers, setRouters] = useState([]); //stored routers currently displayed in UI
  const [showForm, setShowForm] = useState(false); //controls visibility of the add router form 
  const [routerName, setRouterName] = useState(""); //stores the name of the router being added
  const [routerIP, setRouterIP] = useState(""); //stores the IP address of the router being added
  const [error, setError] = useState(""); //stores any error messages related to form validation or backend errors

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
              <button className="delete-btn" onClick={() => handleDeleteRouter(router.id)}>
                Delete
              </button>
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
