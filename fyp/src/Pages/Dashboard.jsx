import React, { useState } from "react";
import RouterCard from "../Components/RouterCard";
import RouterConfigModal from "../Components/RouterConfigModal";
import "./Dashboard.css";

const routersData = [
  {
    id: 1,
    name: "Router 1",
    ip: "192.168.1.1",
    subnet: "255.255.255.0",
    gateway: "192.168.1.254",
    dns: "8.8.8.8",
    status: "Online",
  },
  {
    id: 2,
    name: "Router 2",
    ip: "192.168.0.1",
    subnet: "255.255.255.0",
    gateway: "192.168.0.254",
    dns: "1.1.1.1",
    status: "Online",
  },
];

const Dashboard = () => {
  const [selectedRouter, setSelectedRouter] = useState(null);

  return (
    <div className="dashboard-container">
      <h1>Network Dashboard</h1>
      <p className="subtitle">Detected routers on your network</p>

      <div className="router-grid">
        {routersData.map((router) => (
          <RouterCard
            key={router.id}
            router={router}
            onView={() => setSelectedRouter(router)}
          />
        ))}
      </div>

      {selectedRouter && (
        <RouterConfigModal
          router={selectedRouter}
          onClose={() => setSelectedRouter(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
