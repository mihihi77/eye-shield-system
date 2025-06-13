// src/components/DetectionList.jsx
import React from 'react';
import { Bell, Check, AlertTriangle, User, UserX, Clock } from 'lucide-react';

// Helper functions (giữ nguyên)
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'familiar':
      return <Check className="w-5 h-5 text-green-500" />;
    case 'unfamiliar':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getBorderClass = (status) => {
  switch (status) {
    case 'unfamiliar':
      return 'border-red-500 bg-red-50';
    case 'familiar':
      return 'border-green-500 bg-green-50';
    default:
      return 'border-gray-300 bg-white';
  }
};

const DetectionList = ({ detections, noResultsMessage, onImageClick, classifyPerson, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Bell className="w-6 h-6 mr-2 text-green-600" />
        {title || "Detections"}
        {detections.length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {detections.length}
          </span>
        )}
      </h3>

      {detections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{noResultsMessage || "No detections found."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {detections.map((alert) => (
            <div key={alert.id} className={`border-2 rounded-lg p-4 transition-all duration-200 ${getBorderClass(alert.status)}`}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(alert.status)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">{alert.message}</p>
                    <span className="text-sm text-gray-500">
                      {alert.date} at {alert.time}
                    </span>
                  </div>
                  
                  {alert.image && (
                    <div className="mt-2 flex items-center space-x-2">
                      <img
                        src={alert.image}
                        alt="Detection Snapshot"
                        // Thay đổi kích thước ảnh ở đây
                        className="w-20 h-20 object-cover rounded cursor-pointer border border-gray-200 hover:opacity-80 transition-opacity"
                        onClick={() => onImageClick(alert.image)}
                      />
                      <span className="text-sm text-blue-600 cursor-pointer hover:underline" onClick={() => onImageClick(alert.image)}>
                        Click to view
                      </span>
                    </div>
                  )}

                  {alert.status === 'pending' && classifyPerson && (
                    <div className="mb-3 mt-3">
                      <p className="text-sm text-gray-600 mb-3">
                        Please classify this person:
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => classifyPerson(alert.id, 'familiar')}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Known Person
                        </button>
                        <button
                          onClick={() => classifyPerson(alert.id, 'unfamiliar')}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Stranger
                        </button>
                      </div>
                    </div>
                  )}

                  {alert.status !== 'pending' && (
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${alert.status === 'unfamiliar' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {alert.status === 'unfamiliar' ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Stranger Alert
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-1" />
                            Known Person
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {title === "Latest Detections" && detections.length > 0 && (
            <div className="text-center pt-4 border-t mt-4">
              <p className="text-sm text-gray-500">
                View all in History →
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetectionList;