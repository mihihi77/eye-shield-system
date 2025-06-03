// RecentDetection.jsx
import React from 'react';
import { Bell, Check, AlertTriangle, User, UserX, Clock } from 'lucide-react';

const RecentDetection = ({ notifications, classifyPerson }) => {

  const getNotificationIcon = (notification) => {
    if (notification.status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    if (notification.personType === 'stranger') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (notification.personType === 'known') {
      return <Check className="w-5 h-5 text-green-500" />;
    }
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getNotificationBorder = (notification) => {
    if (notification.personType === 'stranger') {
      return 'border-red-500 bg-red-50';
    }
    if (notification.personType === 'known') {
      return 'border-green-500 bg-green-50';
    }
    return 'border-gray-300 bg-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Bell className="w-6 h-6 mr-2 text-green-600" />
        Latest Detections
        {notifications.length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {Math.min(notifications.length, 3)}
          </span>
        )}
      </h3>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No detections yet. Capture an image to start monitoring.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className={`border-2 rounded-lg p-4 transition-all duration-200 ${getNotificationBorder(notification)}`}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Person Detected
                    </h4>
                    <span className="text-sm text-gray-500">
                      {notification.timestamp}
                    </span>
                  </div>

                  {notification.status === 'pending' && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-3">
                        Please classify this person:
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => classifyPerson(notification.id, 'known')}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Known Person
                        </button>
                        <button
                          onClick={() => classifyPerson(notification.id, 'stranger')}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Stranger
                        </button>
                      </div>
                    </div>
                  )}

                  {notification.status === 'classified' && (
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${notification.personType === 'stranger' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {notification.personType === 'stranger' ? (
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

          {notifications.length > 3 && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                {notifications.length - 3} more detections available
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1">
                View all in History →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentDetection;
