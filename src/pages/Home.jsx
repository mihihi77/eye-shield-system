import React, { useState, useEffect } from 'react';
import CameraFrame from "../features/Home/CameraFrame";
import DetectionList from '../components/DetectionList';
import ImageModal from '../components/ImageModal';
import { addDetect, listenToDetects, updateDetect } from '../utils/firebaseDetect';

const Home = () => {
  const [notifications, setNotifications] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Realtime: chỉ lấy những detect có status === 'pending'
  useEffect(() => {
    const unsubscribe = listenToDetects((allDetects) => {
      const pendingOnly = allDetects.filter((d) => d.status === 'pending');
      setNotifications(pendingOnly);
    });
    return () => unsubscribe(); // cleanup khi unmount
  }, []);

  // Capture ảnh và lưu lên Firebase
  const captureImage = async (imageSrc) => {
    setIsCapturing(true);
    const now = new Date();

    const newDetection = {
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      message: 'Camera detected motion',
      status: 'pending',
      image: imageSrc, // image từ webcam hoặc ESP32 sau này
    };

    await addDetect(newDetection);
    setIsCapturing(false);
  };

  // Xác nhận người quen/lạ
  const classifyPerson = async (id, status) => {
    await updateDetect(id, { status });
    // Không cần cập nhật thủ công vì onSnapshot tự cập nhật
  };

  return (
    <div className="min-h-screen bg-[#ffe9c7]">
      <div className="container mx-auto p-6">
        

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