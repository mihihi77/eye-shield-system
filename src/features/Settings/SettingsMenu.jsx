// src/components/SettingsMenu.js
import React from 'react';

const menuItems = [
  { label: 'Detection Settings', icon: '👁️' },
  { label: 'Schedule', icon: '📅' },
  { label: 'Capture', icon: '📷' },
  { label: 'Alarm System', icon: '🔔' },
  { label: 'Mail', icon: '✉️' },
  { label: 'Upload Service', icon: '🗂️' },
  { label: 'About', icon: 'ℹ️' }
];

const SettingsMenu = ({ onSelect }) => {
  return (
    <div style={{ width: '220px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {menuItems.map((item) => (
        <div
          key={item.label}
          onClick={() => onSelect(item.label)}
          style={{
            padding: '15px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <span style={{ marginRight: '10px' }}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
export default SettingsMenu;
