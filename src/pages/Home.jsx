// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import CameraFrame from "../features/Home/CameraFrame";
import DetectionList from '../components/DetectionList'; // Import DetectionList
import ImageModal from '../components/ImageModal';     // Import ImageModal
import { addDetect, getRecentDetects, updateDetect } from '../utils/detectStorage';

const Home = () => {
  const [notifications, setNotifications] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Load 3 detect gần nhất khi vào trang
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
        status: 'pending', // Trạng thái ban đầu là 'pending'
        image: base64Image,
      };
      
      addDetect(newDetection);
      setNotifications(getRecentDetects()); // Cập nhật danh sách hiển thị
      setIsCapturing(false);
    }, 2000);
  };

  const classifyPerson = (id, status) => {
    // Cập nhật trạng thái của detection trong localStorage
    updateDetect(id, { status: status });
    // Tải lại danh sách thông báo để cập nhật UI
    setNotifications(getRecentDetects());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Home</h2>
        
        {/* Camera Frame */}
        <div className="max-w-2xl mx-auto">
          <CameraFrame isCapturing={isCapturing} onCapture={captureImage} />
        </div>

        {/* Recent Detections - Sử dụng DetectionList component */}
        {/* Truyền classifyPerson và title khác để tùy chỉnh behavior và tiêu đề */}
        <div className="max-w-2xl mx-auto mt-8">
          <DetectionList
            detections={notifications} // Truyền 3 detections gần nhất
            noResultsMessage="No recent detections."
            onImageClick={setSelectedImage}
            classifyPerson={classifyPerson} // Truyền hàm phân loại vào đây
            title="Latest Detections"
          />
        </div>

        {/* Sử dụng ImageModal component */}
        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      </div>
    </div>
  );
};

export default Home;