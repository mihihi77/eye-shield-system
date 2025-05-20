// src/components/AlarmSystem.js
import React, { useState } from "react";

const AlarmSystem = () => {
  const [volume, setVolume] = useState(50);
  const [duration, setDuration] = useState(10);
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl border border-pink-200">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">Alarm System</h2>

      <div className="space-y-5 text-left">
        <div>
          <label className="font-medium text-gray-700">Alarm Volume:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>

        <div>
          <label className="font-medium text-gray-700">Alarm Duration (seconds):</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="border px-3 py-1 mt-1 rounded w-24"
          />
        </div>

        <button
          onClick={handleToggle}
          className={`px-5 py-2 rounded font-semibold text-white transition duration-200 ${
            enabled
              ? "bg-pink-500 hover:bg-pink-600"
              : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          {enabled ? "Disable Alarm" : "Enable Alarm"}
        </button>

        <p className={`mt-2 font-medium ${enabled ? "text-pink-600" : "text-gray-500"}`}>
          Status: {enabled ? "Enabled" : "Disabled"}
        </p>
      </div>
    </div>
  );
};

export default AlarmSystem;
