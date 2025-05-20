// src/layout/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const activeStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };

  return (
    <nav style={{ marginTop: '10px' }}>
      <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : { color: 'white', marginRight: 15 })}>
        Home
      </NavLink>
      <NavLink to="/history" style={({ isActive }) => (isActive ? activeStyle : { color: 'white', marginRight: 15 })}>
        History
      </NavLink>
      <NavLink to="/settings" style={({ isActive }) => (isActive ? activeStyle : { color: 'white' })}>
        Settings
      </NavLink>
    </nav>
  );
}
