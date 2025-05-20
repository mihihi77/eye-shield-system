import React, { useState } from "react";

const Capture = () => {
  const [enabled, setEnabled] = useState(false);
  const [quality, setQuality] = useState(50);

  return (
    <div style={{ textAlign: "left" }}>
      <h2>Capture Settings</h2>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>Image Quality:</label>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        />
      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        style={{
          backgroundColor: enabled ? "#f472b6" : "#e0e0e0",
          color: enabled ? "white" : "#333",
          border: "none",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        {enabled ? "Disable Capture" : "Enable Capture"}
      </button>

      <p>Status: {enabled ? "Enabled" : "Disabled"}</p>
    </div>
  );
};

export default Capture;
