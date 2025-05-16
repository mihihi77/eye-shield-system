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
      <NavLink to="/alerts" style={({ isActive }) => (isActive ? activeStyle : { color: 'white', marginRight: 15 })}>
        Alert
      </NavLink>
      <NavLink to="/history" style={({ isActive }) => (isActive ? activeStyle : { color: 'white', marginRight: 15 })}>
        History
      </NavLink>
      <NavLink to="/manage" style={({ isActive }) => (isActive ? activeStyle : { color: 'white' })}>
        Manage
      </NavLink>
    </nav>
  );
}
