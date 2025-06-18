import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const CameraFrame = ({ isCapturing, onCapture }) => {
  const [cameraStream, setCameraStream] = useState("");

  // Địa chỉ IP của ESP32
  const esp32IP = "192.168.4.1"; // Địa chỉ IP của ESP32, thay đổi nếu cần
  const esp32StreamUrl = `http://${esp32IP}/stream`; // URL stream

  useEffect(() => {
    // Kiểm tra xem stream có sẵn từ ESP32 không, nếu có thì thiết lập nó
    if (esp32StreamUrl) {
      setCameraStream(esp32StreamUrl);
    }
  }, [esp32StreamUrl]);  // Cập nhật lại khi esp32StreamUrl thay đổi

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Camera className="w-6 h-6 mr-2 text-blue-600" />
        Camera Feed
      </h3>

      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        {cameraStream ? (
          <img
            src={cameraStream}
            alt="ESP32 Camera Feed"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">ESP32 Camera Feed</p>
              <p className="text-sm opacity-75">Connecting to camera...</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onCapture}
          disabled={isCapturing}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${isCapturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
        >
          {isCapturing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Capturing...
            </div>
          ) : (
            <div className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Capture Image
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default CameraFrame;
