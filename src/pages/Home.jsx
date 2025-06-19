import React, { useState, useEffect, useCallback } from 'react';
import CameraFrame from "../features/Home/CameraFrame"; // Component webcam của bạn
import DetectionList from '../components/DetectionList'; // Component danh sách phát hiện của bạn
import ImageModal from '../components/ImageModal'; // Component modal ảnh của bạn
import { addDetect, listenToDetects, updateDetect } from '../utils/firebaseDetect'; // Firebase utils của bạn

import '../App.css'; // File CSS chung hoặc tạo Home.css nếu bạn muốn

// Đảm bảo BASE_BACKEND_URL khớp với địa chỉ và cổng của server Flask của bạn
const BASE_BACKEND_URL = 'http://172.22.144.1:5000'; // Đổi IP này thành IP của backend Flask của bạn

const Home = () => {
  // --- STATE CŨ TỪ FIREBASE VÀ WEBCAM ---
  const [notifications, setNotifications] = useState([]); // Realtime detects từ Firebase
  const [isCapturing, setIsCapturing] = useState(false); // Trạng thái capture của webcam
  const [selectedImage, setSelectedImage] = useState(null); // Ảnh được chọn để xem trong modal

  // --- STATE MỚI CHO TÍCH HỢP BACKEND FLASK ---
  const [latestImageInfo, setLatestImageInfo] = useState(null); // Thông tin ảnh mới nhất từ Flask
  const [loadingFlaskData, setLoadingFlaskData] = useState(true); // Trạng thái tải dữ liệu Flask
  const [flaskError, setFlaskError] = useState(null); // Lỗi từ Flask backend
  const [knownPeople, setKnownPeople] = useState([]); // Danh sách người đã biết từ Flask
  const [newPersonName, setNewPersonName] = useState(''); // Input cho tên người mới (khi gắn nhãn)
  const [selectedPerson, setSelectedPerson] = useState(''); // Select cho người đã biết (khi gắn nhãn)

  // --- useEffect CŨ: Lắng nghe Firebase detects (pending) ---
  useEffect(() => {
    const unsubscribe = listenToDetects((allDetects) => {
      const pendingOnly = allDetects.filter((d) => d.status === 'pending');
      setNotifications(pendingOnly);
    });
    return () => unsubscribe(); // cleanup khi unmount
  }, []);

  // --- Hàm CŨ: Capture ảnh từ webcam và lưu lên Firebase ---
  const captureImage = async (imageSrc) => {
    setIsCapturing(true);
    const now = new Date();

    const newDetection = {
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      message: 'Manual camera capture', // Đổi message để phân biệt
      status: 'pending', // Có thể để pending hoặc 'manual_capture'
      image: imageSrc, // image từ webcam
    };

    await addDetect(newDetection);
    setIsCapturing(false);
  };

  // --- Hàm CŨ: Xác nhận người quen/lạ cho Firebase detects ---
  // Lưu ý: Hàm này dùng cho DetectionList của Firebase.
  // Chúng ta sẽ có hàm riêng sendFeedback cho ảnh từ Flask.
  const classifyPersonFirebase = async (id, status) => {
    await updateDetect(id, { status });
    // Không cần cập nhật thủ công vì onSnapshot tự cập nhật
  };

  // --- HÀM MỚI: Tải thông tin ảnh mới nhất từ Flask backend ---
  const fetchLatestImageInfo = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/latest_image_info`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLatestImageInfo(data);
      // Đồng bộ trạng thái input nếu ảnh đang chờ feedback
      if (data.status === 'success' && data.awaiting_feedback && data.prediction !== "No Face Detected" && data.prediction !== "Recognition Error") {
        if (knownPeople.includes(data.prediction)) {
          setSelectedPerson(data.prediction);
          setNewPersonName('');
        } else {
          setSelectedPerson('');
          setNewPersonName('');
        }
      } else {
        setSelectedPerson('');
        setNewPersonName('');
      }
      setFlaskError(null);
    } catch (e) {
      console.error("Failed to fetch latest image info from Flask:", e);
      setFlaskError("Failed to connect to backend or fetch image info.");
      setLatestImageInfo(null);
    } finally {
      setLoadingFlaskData(false);
    }
  }, [knownPeople]);

  // --- HÀM MỚI: Tải danh sách người đã biết từ Flask backend ---
  const fetchKnownPeople = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/get_known_people`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        setKnownPeople(data.people);
      }
    } catch (e) {
      console.error("Failed to fetch known people from Flask:", e);
    }
  }, []);

  // --- useEffect MỚI: Polling để cập nhật ảnh từ Flask và danh sách người đã biết ---
  useEffect(() => {
    // Fetch initial data
    fetchKnownPeople();
    fetchLatestImageInfo();

    // Set up polling for image info (e.g., every 2 seconds)
    const imageInfoInterval = setInterval(fetchLatestImageInfo, 2000); 
    // Set up polling for known people (e.g., less frequent, every 10 seconds)
    const knownPeopleInterval = setInterval(fetchKnownPeople, 10000);

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(imageInfoInterval);
      clearInterval(knownPeopleInterval);
    };
  }, [fetchLatestImageInfo, fetchKnownPeople]);

  // --- HÀM MỚI: Gửi feedback về ảnh từ Flask đến backend ---
  const sendFeedback = async (feedbackType) => {
    if (!latestImageInfo || !latestImageInfo.filename) {
      alert("No ESP32 image to provide feedback for.");
      return;
    }

    let personName = null;
    if (feedbackType === 'known') {
      if (selectedPerson === 'addNew' && newPersonName.trim()) {
        personName = newPersonName.trim();
      } else if (selectedPerson && selectedPerson !== 'addNew') {
        personName = selectedPerson;
      } else {
        alert("Please select or enter a person's name for 'Known' feedback.");
        return;
      }
    }

    const payload = {
      filename: latestImageInfo.filename,
      feedback_type: feedbackType,
      person_name: personName,
    };

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Feedback sent to Flask: ${result.message}`);
      console.log("Flask feedback response:", result);

      // Sau khi gửi feedback thành công, cập nhật trạng thái để ảnh không còn chờ feedback
      fetchLatestImageInfo(); // Để backend đặt awaiting_feedback = False
      fetchKnownPeople(); // Cập nhật lại danh sách người quen (nếu có người mới)
      setNewPersonName('');
      setSelectedPerson('');

      // Tùy chọn: Nếu bạn muốn đồng bộ ảnh này vào Firebase history sau khi gắn nhãn
      // Bạn có thể thêm logic addDetect vào đây, nhưng cần đảm bảo không trùng lặp
      // và có thể xử lý việc cập nhật status nếu nó đã tồn tại trong Firebase
      /*
      const firebaseImageSrc = `${BASE_BACKEND_URL}/get_image/${latestImageInfo.filename}`;
      const now = new Date();
      const firebaseNewDetection = {
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        message: `Face recognized: ${personName || 'Unknown'} (from ESP32-CAM)`,
        status: feedbackType, // 'known' hoặc 'unknown'
        image: firebaseImageSrc,
      };
      await addDetect(firebaseNewDetection); // Cẩn thận với trùng lặp nếu ESP32 gửi liên tục
      */

    } catch (e) {
      console.error("Error sending feedback to Flask:", e);
      alert(`Failed to send feedback to Flask: ${e.message}`);
    }
  };

  // --- HÀM MỚI: Kích hoạt huấn luyện lại mô hình AI trên Flask ---
  const retrainModel = async () => {
    if (!window.confirm("Are you sure you want to retrain the AI model? This may take some time.")) {
      return;
    }
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/retrain_model`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      alert(`Model retraining: ${result.message}`);
      console.log("Retrain model response:", result);
    } catch (e) {
      console.error("Error retraining model:", e);
      alert(`Failed to retrain model: ${e.message}`);
    }
  };

  // Nếu đang tải dữ liệu từ Flask, hiển thị loading
  if (loadingFlaskData) {
    return (
      <div className="min-h-screen bg-[#ffe9c7] flex justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800">Loading EyeShield Dashboard...</h2>
      </div>
    );
  }

  // Nếu có lỗi kết nối Flask backend
  if (flaskError) {
    return (
      <div className="min-h-screen bg-[#ffe9c7] flex flex-col justify-center items-center p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error: {flaskError}</h2>
        <p className="text-gray-700">Please ensure your Flask backend server is running and accessible at {BASE_BACKEND_URL}.</p>
      </div>
    );
  }

  // Lấy URL ảnh từ Flask backend để hiển thị
  const flaskImageUrl = latestImageInfo && latestImageInfo.filename 
    ? `${BASE_BACKEND_URL}/get_image/${latestImageInfo.filename}` 
    : 'placeholder.png'; // Đặt một ảnh placeholder trong public/ nếu không có ảnh

  return (
    <div className="min-h-screen bg-[#ffe9c7]">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">EyeShield Home Dashboard</h2>

        {/* --- KHU VỰC HIỂN THỊ ẢNH VÀ PHẢN HỒI TỪ ESP32-CAM/FLASK --- */}
        <div className="max-w-2xl mx-auto mb-12 bg-white shadow-lg rounded-lg p-6">
          <div className="App-header"> {/* Sử dụng class App-header từ App.css nếu có */}
            <h3 className="text-2xl font-semibold text-gray-800">Latest AI Detection (from ESP32-CAM)</h3>
            <button className="retrain-button" onClick={retrainModel}>
              Retrain AI Model
            </button>
          </div>
          
          {latestImageInfo && latestImageInfo.status === 'success' && (
            <div className="image-container"> {/* Sử dụng class image-container từ App.css */}
              <img 
                src={flaskImageUrl} 
                alt="Latest Capture from ESP32-CAM" 
                className="latest-image" // Sử dụng class latest-image từ App.css
                onClick={() => setSelectedImage(flaskImageUrl)} // Mở modal với ảnh Flask
                onError={(e) => {
                  e.target.onerror = null; // Ngăn chặn vòng lặp vô hạn
                  e.target.src = 'error-placeholder.png'; // Ảnh khi lỗi tải
                  console.error("Failed to load image from Flask:", e.target.src);
                }}
              />
              <p><strong>Timestamp:</strong> {latestImageInfo.timestamp}</p>
              <p><strong>AI Prediction:</strong> <span className="prediction">{latestImageInfo.prediction}</span></p>

              {latestImageInfo.awaiting_feedback && (
                <div className="feedback-section"> {/* Sử dụng class feedback-section từ App.css */}
                  <h3>Is this person known or unknown?</h3>
                  <div className="feedback-buttons"> {/* Sử dụng class feedback-buttons từ App.css */}
                    <button onClick={() => sendFeedback('unknown')}>
                      Mark as Unknown Intruder
                    </button>
                    <div className="known-feedback"> {/* Sử dụng class known-feedback từ App.css */}
                      <select 
                        value={selectedPerson} 
                        onChange={(e) => {
                          setSelectedPerson(e.target.value);
                          if (e.target.value !== 'addNew') {
                            setNewPersonName('');
                          }
                        }}
                      >
                        <option value="">-- Select or Add --</option>
                        {knownPeople.map(person => (
                          <option key={person} value={person}>{person}</option>
                        ))}
                        <option value="addNew">-- Add New Person --</option>
                      </select>
                      {selectedPerson === 'addNew' && (
                        <input
                          type="text"
                          placeholder="Enter New Person's Name"
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                        />
                      )}
                      <button 
                        onClick={() => sendFeedback('known')}
                        disabled={!selectedPerson || (selectedPerson === 'addNew' && !newPersonName.trim())}
                      >
                        Mark as Known
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {!latestImageInfo.awaiting_feedback && (
                <p className="feedback-status">Waiting for new motion detection from ESP32-CAM...</p>
              )}
            </div>
          )}
          {latestImageInfo && latestImageInfo.status === 'no_image' && (
            <p className="text-gray-600">No image has been uploaded yet by the ESP32-CAM. Please wait for motion detection.</p>
          )}
        </div>

        {/* --- KHU VỰC WEBCAM CAPTURE (CŨ) --- */}
        <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Manual Camera Capture (Webcam)</h3>
          <CameraFrame isCapturing={isCapturing} onCapture={captureImage} />
        </div>

        {/* --- KHU VỰC DANH SÁCH PHÁT HIỆN TỪ FIREBASE (CŨ) --- */}
        <div className="max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
          <DetectionList
            detections={notifications}
            noResultsMessage="No recent pending detections."
            onImageClick={setSelectedImage} // Vẫn dùng ImageModal chung
            classifyPerson={classifyPersonFirebase} // Sử dụng hàm Firebase riêng
            title="Pending Detections (from Firebase)"
          />
        </div>

        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      </div>
    </div>
  );
};

export default Home;