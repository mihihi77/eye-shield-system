import React, { useState } from 'react';

const History = () => {
  // Mock dữ liệu cảnh báo
  const initialData = [
    { id: 1, date: '2025-05-30', time: '15:00', message: 'Camera detected motion', status: 'unfamiliar' },
    { id: 2, date: '2025-05-29', time: '18:00', message: 'System armed', status: 'familiar' },
    { id: 3, date: '2025-05-30', time: '08:00', message: 'User login', status: 'familiar' },
    { id: 4, date: '2025-05-28', time: '22:00', message: 'Low battery', status: 'unfamiliar' },
  ];

  const [alerts] = useState(initialData);  // Dữ liệu gốc
  const [filteredAlerts, setFilteredAlerts] = useState(initialData);  // Dữ liệu đã lọc

  // Trạng thái lọc
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Hàm lọc dữ liệu
  const handleFilter = (e) => {
    e.preventDefault();

    let filtered = alerts;

    // Lọc theo ngày bắt đầu và kết thúc
    if (filterStartDate) {
      filtered = filtered.filter((alert) => alert.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter((alert) => alert.date <= filterEndDate);
    }

    // Lọc theo trạng thái người (lạ hoặc quen)
    if (filterStatus) {
      filtered = filtered.filter((alert) => alert.status === filterStatus);
    }

    // Sắp xếp theo ngày và giờ
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB - dateTimeA;
    });

    setFilteredAlerts(filtered);  // Cập nhật kết quả lọc
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-10 px-4">

      {/* Form lọc */}
      <form
        onSubmit={handleFilter}
        className="mb-8 w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Filter</h2>

        {/* Bộ lọc ngày bắt đầu */}
        <div>
          <label htmlFor="filter-start-date" className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            id="filter-start-date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Bộ lọc ngày kết thúc */}
        <div>
          <label htmlFor="filter-end-date" className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            id="filter-end-date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Bộ lọc trạng thái */}
        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium mb-1">Status</label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="familiar">Familiar</option>
            <option value="unfamiliar">Unfamiliar</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </form>

      {/* Kết quả lọc */}
      <div className="w-full max-w-md space-y-4">
        {filteredAlerts.length === 0 ? (
          <p className="text-center text-gray-600">No results found.</p>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="font-semibold">{alert.message}</p>
              <p className="text-sm text-gray-500">
                {alert.date} at {alert.time} - {alert.status === 'unfamiliar' ? 'Unfamiliar' : 'Familiar'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
