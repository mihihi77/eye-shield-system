// Home.jsx
import React, { useState } from 'react';
import CameraFrame from "../features/Home/CameraFrame";
import RecentDetection from "../features/Home/RecentDetect";

const Home = () => {
  const [notifications, setNotifications] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureImage = () => {
    setIsCapturing(true);
    
    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        image: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`, // Placeholder base64 image (chuỗi base64 ảnh)
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setIsCapturing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Home</h2>
        
        <CameraFrame isCapturing={isCapturing} onCapture={captureImage} />
        <RecentDetection notifications={notifications} />
      </div>
    </div>
  );
};

export default Home;
