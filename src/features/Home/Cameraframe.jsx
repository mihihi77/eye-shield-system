import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import nipplejs from 'nipplejs';

const CameraFrame = ({ isCapturing, onCapture }) => {
  const webcamRef = useRef(null);
  const joystickRef = useRef(null); // Ref để tránh render nhiều joystick

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc); // Gửi ảnh base64 thật lên Firebase
    }
  };

  // Khởi tạo joystick sau khi render
  useEffect(() => {
    if (joystickRef.current) return; // Tránh gắn lại nếu đã gắn

    const zone = document.getElementById('joystick-container');
    if (zone) {
      joystickRef.current = nipplejs.create({
        zone: zone,
        mode: 'static',
        position: { left: '100%', top: '55%' },
        color: '#f34d4d',              // Màu xám
        size: 65,                   // To hơn (mặc định là 60)
        restOpacity: 0.8,           // Trong suốt nhẹ khi không di chuyển
        dynamicPage: true 
      });
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Camera className="w-6 h-6 mr-2 text-blue-600" />
        ESP32cam Preview
      </h3>

      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Nút + Joystick nằm ngang */}
      <div className="flex justify-center items-center gap-0">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`px-10 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
            isCapturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
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

        {/* Joystick nằm bên phải nút */}
        <div id="joystick-container" className="w-[80px] h-[80px] relative"></div>
      </div>
    </div>
  );
};

export default CameraFrame;
