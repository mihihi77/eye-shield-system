import React, { useState } from "react";

const DetectionSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState(5);

  return (
    <div style={{ textAlign: "left" }}>
      <h2>Detection Settings</h2>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>Sensitivity:</label>
        <input
          type="range"
          min="1"
          max="10"
          value={sensitivity}
          onChange={(e) => setSensitivity(Number(e.target.value))}
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
        {enabled ? "Disable Detection" : "Enable Detection"}
      </button>

      <p>Status: {enabled ? "Enabled" : "Disabled"}</p>
    </div>
  );
};

export default DetectionSettings;
