import React, { useState, useEffect } from 'react';
import { listenToDetects, updateDetect } from '../utils/firebaseDetect';
import DetectionList from '../components/DetectionList';
import ImageModal from '../components/ImageModal';

const History = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const unsubscribe = listenToDetects((allDetects) => {
      setAlerts(Array.isArray(allDetects) ? allDetects : []);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!Array.isArray(alerts)) return;

    let filtered = [...alerts];

    if (filterStartDate) {
      filtered = filtered.filter((alert) => alert.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter((alert) => alert.date <= filterEndDate);
    }
    if (filterStatus) {
      filtered = filtered.filter((alert) => alert.status === filterStatus);
    }

    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB - dateTimeA;
    });

    setFilteredAlerts(filtered);
  }, [alerts, filterStartDate, filterEndDate, filterStatus]);

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterStatus('');
  };

  const classifyPerson = async (id, status) => {
    await updateDetect(id, { status });
  };

  return (
    <div className="min-h-screen bg-[#ffe9c7]">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">History</h2>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Filter</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All</option>
                <option value="familiar">Familiar</option>
                <option value="unfamiliar">Unfamiliar</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {}}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Apply Filter
              </button>
              <button
                onClick={clearFilters}
                className="px-4 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Cho phép xác nhận từ trang History */}
          <DetectionList
            detections={filteredAlerts}
            noResultsMessage="No results found."
            onImageClick={setSelectedImage}
            classifyPerson={classifyPerson}
            title={`Detection Results (${filteredAlerts.length})`}
          />
        </div>
      </div>

      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default History;
