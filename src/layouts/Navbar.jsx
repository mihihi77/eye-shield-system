import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const activeStyle = {
    fontWeight: 'bold',
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-800 text-white shadow-md px-6 py-3">
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
            className="py-2 border-b border-gray-600 hover:bg-gray-600 hover:text-red-500 hover:pl-2 transition-all"
          >
            Home
          </NavLink>
          <NavLink
            to="/history"
            style={({ isActive }) => (isActive ? activeStyle : {})}
            className="py-2 border-b border-gray-600 hover:bg-gray-600 hover:text-red-500 hover:pl-2 transition-all"
          >
            History
          </NavLink>
          <NavLink
            to="/settings"
            style={({ isActive }) => (isActive ? activeStyle : {})}
            className="py-2 hover:bg-gray-600 hover:text-red-500 hover:pl-2 transition-all"
          >
            Settings
          </NavLink>
        </div>
      </div>

      {/* Logo */}
      <div className="font-bold transition-transform hover:scale-110 hover:text-red-500">
        EyeShield
      </div>
    </div>

    {/* Right Section */}
    <div className="flex items-center relative">
      <div
        className="text-lg cursor-pointer p-1 transition-transform hover:scale-125"
        onClick={() => setShowFilter((prev) => !prev)}
      >
        🔍
      </div>

      {showFilter && (
        <div className="absolute top-10 right-0 bg-gray-700 text-white p-5 rounded-xl shadow-lg flex flex-col gap-4 w-64 z-50">
          <div>
            <label htmlFor="day" className="block mb-1">
              Day:
            </label>
            <input
              type="date"
              id="day"
              name="day"
              className="w-full p-2 rounded border-none text-black"
            />
          </div>
          <div>
            <label htmlFor="time" className="block mb-1">
              Time:
            </label>
            <input
              type="time"
              id="time"
              name="time"
              className="w-full p-2 rounded border-none text-black"
            />
          </div>
        </div>
      )}
    </div>

  </div>
</nav>

  );
}
