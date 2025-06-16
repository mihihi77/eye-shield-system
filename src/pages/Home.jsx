import React, { useState, useEffect } from 'react';
import CameraFrame from "../features/Home/CameraFrame";
import DetectionList from '../components/DetectionList';
import ImageModal from '../components/ImageModal';
import { addDetect, getRecentDetects, updateDetect } from '../utils/detectStorage';

const Home = () => {
  const [notifications, setNotifications] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const data = getRecentDetects();
    setNotifications(data);
  }, []);

  const captureImage = () => {
    setIsCapturing(true);
    setTimeout(() => {
      const now = new Date();
      const base64Image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHElEQVQYV2NkYGD4z0AEYBxVSFQAZpgwGgAAvZIBZw+l9bcAAAAASUVORK5CYII=';
      
      const newDetection = {
        id: now.getTime(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        message: 'Camera detected motion',
        status: 'pending',
        image: base64Image,
      };
      
      addDetect(newDetection);
      setNotifications(getRecentDetects());
      setIsCapturing(false);
    }, 2000);
  };

  const classifyPerson = (id, status) => {
    updateDetect(id, { status: status });
    setNotifications(getRecentDetects());
  };

  return (
    <div className="min-h-screen bg-[#ffe9c7]">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Home</h2>
        
        <div className="max-w-2xl mx-auto">
          <CameraFrame isCapturing={isCapturing} onCapture={captureImage} />
        </div>

        <div className="max-w-2xl mx-auto mt-8">
          <DetectionList
            detections={notifications}
            noResultsMessage="No recent detections."
            onImageClick={setSelectedImage}
            classifyPerson={classifyPerson}
            title="Latest Detections"
          />
        </div>

        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      </div>
    </div>
  );
};

export default Home;
