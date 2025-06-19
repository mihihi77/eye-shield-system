import React, { useRef, useLayoutEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import nipplejs from 'nipplejs';

const CameraFrame = ({ isCapturing, onCapture }) => {
  const webcamRef = useRef(null);
  const joystickRef = useRef(null);
  const joystickZoneRef = useRef(null);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  };

  useLayoutEffect(() => {
    if (joystickRef.current || !joystickZoneRef.current) return;

    joystickRef.current = nipplejs.create({
      zone: joystickZoneRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: '#f34d4d',
      size: 75,
      threshold: 0.1,
      fadeTime: 100,
      restOpacity: 0.8,
      dynamicPage: false, // ❗️ Bắt buộc để gắn vào đúng vùng, không đè
      multitouch: false,
      lockX: false,
      lockY: false,
      restJoystick: true,
      catchDistance: 100,
      shape: 'circle',
      maxRange: 80
    });

    joystickRef.current.on('start', (evt, data) => {
      console.log('Joystick start:', data);
    });

    joystickRef.current.on('move', (evt, data) => {
      const { angle, distance, vector } = data;
      console.log('Joystick move:', { angle: angle?.degree, distance, vector });
    });

    joystickRef.current.on('end', () => {
      console.log('Joystick end');
    });

    return () => {
      if (joystickRef.current) {
        joystickRef.current.destroy();
        joystickRef.current = null;
      }
    };
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

      <div className="flex justify-center items-center gap-6">
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

        {/* Joystick zone - đã fix z-index và interaction */}
        <div className="flex flex-col items-center">
          <div
            ref={joystickZoneRef}
            className="w-[90px] h-[90px] relative z-0 bg-gray-100 border-2 border-gray-300 rounded-full
                     overflow-visible touch-none select-none cursor-pointer
                     hover:bg-gray-200 transition-colors duration-150 shadow-inner"
          ></div>
          <span className="text-xs text-gray-500 mt-2 select-none">Control</span>
        </div>
      </div>
    </div>
  );
};

export default CameraFrame;
