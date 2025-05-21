import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false); // 👈 filter panel toggle

  const activeStyle = {
    fontWeight: 'bold',
  };

  return (
    <>
      <style>
        {`
          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #333;
            padding: 10px 20px;
            color: white;
            position: relative;
          }

          .navbar-left {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .logo {
            font-weight: bold;
          }

          .logo:hover {
            transform: scale(1.1);
            color: red;
          }

          .hamburger-container {
            position: relative;
            display: flex;
            align-items: center;
            cursor: pointer;
          }

          .hamburger {
            display: flex;
            flex-direction: column;
            gap: 4px;
            cursor: pointer;
            padding: 8px;
            transition: transform 0.3s ease;
          }

          .hamburger:hover {
            color: red;
            transform: scale(1.1);
          }

          .bar {
            width: 25px;
            height: 3px;
            background-color: white;
            transition: background-color 0.3s;
          }

          .dropdown {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 45px;
            left: 0;
            background-color: #444;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 100;
            width: 200px;
          }

          .dropdown.open {
            display: flex;
          }

          .dropdown a {
            padding: 10px 0;
            color: white;
            text-decoration: none;
            border-bottom: 1px solid #666;
            transition: all 0.2s ease;
          }

          .dropdown a:last-child {
            border-bottom: none;
          }

          .dropdown a:hover {
            background-color: #555;
            color: red;
            padding-left: 10px;
          }

          .navbar-right {
            display: flex;
            align-items: center;
            position: relative;
          }

          .search-icon {
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            transition: transform 0.3s ease;
          }

          .search-icon:hover {
            transform: scale(1.2);
          }

          .filter-panel {
            position: absolute;
            top: 40px;
            right: 0;
            background-color: #444;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            color: white;
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 250px;
          }

          .filter-panel label {
            margin-bottom: 5px;
          }

          .filter-panel input {
            padding: 5px;
            border: none;
            border-radius: 5px;
            width: 100%;
          }

          @media (max-width: 768px) {
            .nav-links {
              display: none;
            }
          }
        `}
      </style>

      <nav className="navbar">
        <div className="navbar-left">
          <div
            className="hamburger-container"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <div className="hamburger">
              <div className="bar" />
              <div className="bar" />
              <div className="bar" />
            </div>
            <div className={`dropdown ${menuOpen ? 'open' : ''}`}>
              <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : {})}>
                Home
              </NavLink>
              <NavLink to="/history" style={({ isActive }) => (isActive ? activeStyle : {})}>
                History
              </NavLink>
              <NavLink to="/settings" style={({ isActive }) => (isActive ? activeStyle : {})}>
                Settings
              </NavLink>
            </div>
          </div>
          <div className="logo">Smart Security System</div>
        </div>

        <div className="navbar-right">
          <div className="search-icon" onClick={() => setShowFilter(prev => !prev)}>🔍</div>
          {showFilter && (
            <div className="filter-panel">
              <div>
                <label htmlFor="day">Day:</label>
                <input type="date" id="day" name="day" />
              </div>
              <div>
                <label htmlFor="time">Time:</label>
                <input type="time" id="time" name="time" />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
