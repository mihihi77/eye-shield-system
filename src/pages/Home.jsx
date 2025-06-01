// src/pages/Alert.js
import React, { useState } from 'react';

// Alert component (default export)
const Alert = () => {
  const initialData = [
    { id: 1, date: '2025-05-30', time: '15:00', message: 'Camera detected motion' },
    { id: 2, date: '2025-05-29', time: '18:00', message: 'System armed' },
    { id: 3, date: '2025-05-30', time: '08:00', message: 'User login' },
    { id: 4, date: '2025-05-28', time: '22:00', message: 'Low battery' },
  ];

  const [alerts] = useState(initialData);
  const [filteredAlerts, setFilteredAlerts] = useState(initialData);
  const [filterDay, setFilterDay] = useState('');
  const [filterTime, setFilterTime] = useState('');

  const handleFilter = (e) => {
    e.preventDefault();

    let filtered = alerts;

    if (filterDay) {
      filtered = filtered.filter((alert) => alert.date === filterDay);
    }

    if (filterTime) {
      filtered = filtered.filter((alert) => alert.time >= filterTime);
    }

    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB - dateTimeA;
    });

    setFilteredAlerts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">Home</h1>

      {/* Filter Form */}
      <form
        onSubmit={handleFilter}
        className="mb-8 w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Filter</h2>

        <div>
          <label htmlFor="filter-day" className="block text-sm font-medium mb-1">Day</label>
          <input
            type="date"
            id="filter-day"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="filter-time" className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            id="filter-time"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </form>

      {/* Filtered Results */}
      <div className="w-full max-w-md space-y-4">
        {filteredAlerts.length === 0 ? (
          <p className="text-center text-gray-600">No results found.</p>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="font-semibold">{alert.message}</p>
              <p className="text-sm text-gray-500">
                {alert.date} at {alert.time}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alert;
