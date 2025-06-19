import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const activeStyle = {
    fontWeight: 'bold',
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#304466] text-white shadow-md px-6 py-3">
      <div className="flex justify-between items-center w-full">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Hamburger */}
          <div
            className="relative flex items-center cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div className="flex flex-col gap-1 p-2 transition-transform hover:scale-110 hover:text-red-500">
              <div className="w-6 h-1 bg-white transition-colors" />
              <div className="w-6 h-1 bg-white transition-colors" />
              <div className="w-6 h-1 bg-white transition-colors" />
            </div>

            {/* Dropdown menu */}
            <div
              className={`${
                menuOpen ? 'flex' : 'hidden'
              } flex-col absolute top-12 left-0 bg-gray-700 p-5 rounded-2xl shadow-lg w-48 z-50`}
            >
              <NavLink
                to="/"
                style={({ isActive }) => (isActive ? activeStyle : {})}
                className="py-2 border-b border-gray-600 hover:bg-gray-600 hover:text-[#fd8c4a] hover:pl-2 transition-all"
              >
                Home
              </NavLink>
              <NavLink
                to="/history"
                style={({ isActive }) => (isActive ? activeStyle : {})}
                className="py-2 border-b border-gray-600 hover:bg-gray-600 hover:text-[#fd8c4a] hover:pl-2 transition-all"
              >
                History
              </NavLink>
              <NavLink
                to="/settings"
                style={({ isActive }) => (isActive ? activeStyle : {})}
                className="py-2 hover:bg-gray-600 hover:text-[#fd8c4a] hover:pl-2 transition-all"
              >
                Settings
              </NavLink>
            </div>
          </div>

          {/* Logo */}
          <div className="font-bold transition-transform hover:scale-110 hover:text-[#fd8c4a]">
            EyeShield
          </div>
        </div>
      </div>
    </nav>
  );
}
