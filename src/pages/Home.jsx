import React, { useState, useEffect, useCallback, useRef } from 'react';
import CameraFrame from "../features/Home/CameraFrame";
import DetectionList from '../components/DetectionList';
import ImageModal from '../components/ImageModal';
import { io } from 'socket.io-client'; // Thêm dòng này
import { addDetect, listenToDetects, updateDetect } from '../utils/firebaseDetect'; // Giữ lại nếu bạn vẫn dùng Firebase

import '../App.css'; // Đảm bảo file CSS này tồn tại và được cấu hình đúng

// Đổi URL backend của bạn nếu cần
const BASE_BACKEND_URL = 'http://192.168.1.38:5000';

const Home = () => {
    // --- STATE CŨ TỪ FIREBASE VÀ WEBCAM ---
    const [notifications, setNotifications] = useState([]); // Cho DetectionList
    const [isCapturing, setIsCapturing] = useState(false); // Trạng thái đang chụp ảnh
    const [selectedImage, setSelectedImage] = useState(null); // Để hiển thị ảnh trong modal

    // --- STATE MỚI CHO TÍCH HỢP BACKEND FLASK ---
    const [latestImageInfo, setLatestImageInfo] = useState(null); // Thông tin ảnh và dự đoán mới nhất từ AI
    const [loadingFlaskData, setLoadingFlaskData] = useState(true); // Trạng thái tải dữ liệu ban đầu
    const [flaskError, setFlaskError] = useState(null); // Lỗi kết nối backend
    const [knownPeople, setKnownPeople] = useState([]); // Danh sách những người đã biết
    const [newPersonName, setNewPersonName] = useState(''); // Tên người mới khi add
    const [selectedPerson, setSelectedPerson] = useState(''); // Người được chọn trong dropdown feedback

    // --- STATE CHO PIR SENSOR VÀ MOTION DETECTION ---
    const [pirStatus, setPirStatus] = useState(false); // Trạng thái motion hiện tại từ PIR
    // const [isWaitingForMotion, setIsWaitingForMotion] = useState(true); // Không cần thiết nếu dùng socket.io
    const [lastMotionTime, setLastMotionTime] = useState(null); // Thời điểm motion cuối cùng
    const [pirSensorActive, setPirSensorActive] = useState(true); // Toggle để bật/tắt PIR auto-capture

    // --- STATE CHO AI TRAINING VÀ XỬ LÝ ---
    const [processingImage, setProcessingImage] = useState(false); // Trạng thái đang xử lý ảnh AI
    const [autoLabelConfidence, setAutoLabelConfidence] = useState(0); // Độ tin cậy của AI
    const [trainingStatus, setTrainingStatus] = useState('idle'); // idle, processing, success, error (cho retrain model)
    const [modelAccuracy, setModelAccuracy] = useState(null); // Độ chính xác của model
    const [isTrainingModel, setIsTrainingModel] = useState(false); // Trạng thái model đang training
    const [manualLabelCount, setManualLabelCount] = useState(0); // Số lượng nhãn thủ công
    const [retrainThreshold, setRetrainThreshold] = useState(50); // Ngưỡng để retrain

    // --- REF CHO WEBCAM, SOCKET.IO VÀ TIMEOUTS ---
    const cameraRef = useRef(null); // Ref cho component CameraFrame
    const socket = useRef(null); // Ref cho Socket.IO client
    const lastCaptureTimeRef = useRef(0); // Để debounce việc chụp ảnh
    const CAPTURE_INTERVAL_SECONDS = 10; // Khoảng thời gian tối thiểu giữa các lần chụp (10 giây)
    const pirTimeoutRef = useRef(null); // Dùng cho debounce của PIR (nếu dùng polling)
    const captureQueueRef = useRef(false); // Tránh trigger capture liên tục từ PIR

    // --- useEffect CŨ: Lắng nghe Firebase detects (GIỮ LẠI NẾU CÓ DÙNG) ---
    useEffect(() => {
        const unsubscribe = listenToDetects((allDetects) => {
            const pendingOnly = allDetects.filter((d) => d.status === 'pending');
            setNotifications(pendingOnly);
        });
        return () => unsubscribe();
    }, []);

    // --- HÀM TỐI ƯU: Gửi ảnh lên backend với xử lý response chi tiết ---
    const sendImageToBackend = useCallback(async (imageSrc, captureType = 'MANUAL') => {
        try {
            setProcessingImage(true);
            setTrainingStatus('processing'); // Coi như đang xử lý AI
            console.log(`[${captureType}] Sending image to AI backend...`);

            const response = await fetch(`${BASE_BACKEND_URL}/upload_image_from_react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageSrc,
                    capture_type: captureType, // 'PIR_AUTO' hoặc 'MANUAL'
                    timestamp: new Date().toISOString()
                }),
                signal: AbortSignal.timeout(30000), // 30 giây timeout cho upload và AI processing
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log(`[${captureType}] AI backend response:`, result);

            // Cập nhật confidence và auto-label status
            setAutoLabelConfidence(result.confidence || 0);
            if (result.is_auto_labeled) {
                setTrainingStatus('success');
                console.log(`[${captureType}] Auto-labeled as: ${result.prediction}`);
            } else {
                // Đặt trạng thái để chờ feedback nếu không auto-labeled
                setTrainingStatus('pending_feedback'); // Trạng thái mới để phân biệt
                console.log(`[${captureType}] Awaiting manual feedback for: ${result.prediction}`);
            }

            // Cập nhật thông tin ảnh mới nhất sau khi AI xử lý (đã có)
            setLatestImageInfo(result.latest_image_info); // Backend nên trả về latest_image_info trong result
            // Auto-select person if prediction matches
            if (result.latest_image_info?.awaiting_feedback && result.latest_image_info?.prediction) {
                const predictedName = result.latest_image_info.prediction;
                if (knownPeople.includes(predictedName)) {
                    setSelectedPerson(predictedName);
                    setNewPersonName('');
                } else if (!predictedName.includes("Unknown") && !predictedName.includes("Error") && predictedName !== "No Face Detected") {
                    setSelectedPerson('addNew');
                    setNewPersonName(predictedName);
                } else {
                    setSelectedPerson('');
                    setNewPersonName('');
                }
            } else {
                setSelectedPerson('');
                setNewPersonName('');
            }


            return result;

        } catch (error) {
            console.error(`[${captureType}] Error sending image to backend:`, error);
            setTrainingStatus('error');
            setFlaskError(`AI processing error: ${error.message}`);
            throw error; // Re-throw to handle in calling function
        } finally {
            setProcessingImage(false);
        }
    }, [knownPeople]);


    // --- HÀM TỐI ƯU: Chụp ảnh từ nhiều nguồn (PIR hoặc Manual) với debounce và queue ---
    const captureImageFromSensor = useCallback(
        async (captureType = 'MANUAL') => {
            // Kiểm tra thời gian chờ để tránh chụp quá nhanh
            const currentTime = Date.now();
            if (currentTime - lastCaptureTimeRef.current < CAPTURE_INTERVAL_SECONDS * 1000) {
                console.log(`Too soon to capture again. Please wait ${CAPTURE_INTERVAL_SECONDS} seconds.`);
                return; // Thoát nếu chưa đủ thời gian chờ
            }

            // Ngăn chặn chụp nếu đang bận hoặc video không sẵn sàng
            if (isCapturing || processingImage || isTrainingModel || !cameraRef.current) return;

            setIsCapturing(true);
            lastCaptureTimeRef.current = currentTime; // Cập nhật thời gian chụp cuối cùng

            try {
                console.log(`[${captureType}] Starting image capture...`);

                // Capture ảnh từ webcam
                const imageSrc = await cameraRef.current.captureImage(); // CameraFrame phải có method captureImage

                if (imageSrc) {
                    // Gửi ảnh lên backend Flask để AI xử lý
                    const aiResult = await sendImageToBackend(imageSrc, captureType);

                    // Lưu vào Firebase để tracking (với thông tin AI)
                    const now = new Date();
                    const firebaseDetection = {
                        timestamp: now.toISOString(),
                        date: now.toISOString().split('T')[0],
                        time: now.toTimeString().split(' ')[0],
                        message: captureType === 'PIR_AUTO' ? 'PIR Auto Capture - AI Processed' : 'Manual Capture - AI Processed',
                        status: aiResult?.is_auto_labeled ? 'resolved' : 'pending',
                        image: imageSrc, // Lưu base64 hoặc URL nếu Firebase hỗ trợ
                        ai_prediction: aiResult?.prediction || 'Processing...',
                        confidence: aiResult?.confidence || 0,
                        capture_type: captureType,
                        // Thêm filename để dễ dàng truy cập ảnh từ Flask
                        filename: aiResult?.latest_image_info?.filename || null
                    };

                    await addDetect(firebaseDetection); // Firebase detects
                    console.log(`[${captureType}] Image processed and saved to Firebase`);

                }
            } catch (error) {
                console.error(`[${captureType}] Error during image capture/processing:`, error);
                // setTrainingStatus('error'); // Không set training status ở đây, để sendImageToBackend lo
            } finally {
                setIsCapturing(false);
                // setProcessingImage(false); // Không set ở đây, sendImageToBackend lo
            }
        },
        [isCapturing, processingImage, isTrainingModel, CAPTURE_INTERVAL_SECONDS, sendImageToBackend] // Dependencies
    );

    // --- HÀM CŨ ĐƯỢC SỬA: Capture thủ công với AI processing ---
    const captureImageManual = useCallback(async () => {
        await captureImageFromSensor('MANUAL');
    }, [captureImageFromSensor]);


    // --- HÀM CŨ: Xác nhận người quen/lạ cho Firebase detects ---
    const classifyPersonFirebase = async (id, status) => {
        await updateDetect(id, { status });
    };

    // --- HÀM TỐI ƯU: Tải thông tin ảnh mới nhất (chỉ dùng khi polling hoặc init) ---
    const fetchLatestImageInfo = useCallback(async (retryCount = 0) => {
        try {
            const response = await fetch(`${BASE_BACKEND_URL}/latest_image_info`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLatestImageInfo(data);

            // Smart UI update based on AI prediction (chỉ khi có feedback)
            if (data.status === 'success' && data.awaiting_feedback) {
                if (data.prediction && data.prediction !== "No Face Detected" && data.prediction !== "Recognition Error" && data.prediction !== "Unknown") {
                    // Nếu prediction match với known people, auto-select
                    if (knownPeople.includes(data.prediction)) {
                        setSelectedPerson(data.prediction);
                        setNewPersonName('');
                    } else {
                        // Nếu là prediction mới, suggest để add
                        setSelectedPerson('addNew');
                        setNewPersonName(data.prediction);
                    }
                } else {
                    setSelectedPerson('');
                    setNewPersonName('');
                }
            } else {
                setSelectedPerson('');
                setNewPersonName('');
            }
            setAutoLabelConfidence(data.confidence || 0); // Update confidence

            setFlaskError(null);
        } catch (e) {
            console.error("Failed to fetch latest image info from Flask:", e);
            if (retryCount < 3) {
                setTimeout(() => fetchLatestImageInfo(retryCount + 1), 2000);
                return;
            }
            setFlaskError("Failed to connect to AI backend or fetch image info. Please check connection.");
            setLatestImageInfo(null);
        } finally {
            setLoadingFlaskData(false);
        }
    }, [knownPeople]);

    // --- HÀM TỐI ƯU: Tải danh sách người đã biết với caching ---
    const fetchKnownPeople = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_BACKEND_URL}/known_persons`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                // Chỉ update nếu có thay đổi để tránh re-render không cần thiết
                if (JSON.stringify(knownPeople) !== JSON.stringify(data.people)) {
                    setKnownPeople(data.people);
                    console.log("Updated known people list:", data.people);
                }
            }
        } catch (e) {
            console.error("Failed to fetch known people from Flask:", e);
        }
    }, [knownPeople]); // Dependency để tránh loop nếu knownPeople thay đổi

    // --- HÀM TỐI ƯU: Gửi feedback với validation và auto-training ---
    const sendFeedback = async (feedbackType) => {
        if (!latestImageInfo || !latestImageInfo.filename || !latestImageInfo.awaiting_feedback) {
            alert("No image available or feedback not required for the latest image.");
            return;
        }

        let personName = null;
        if (feedbackType === 'known') {
            if (selectedPerson === 'addNew' && newPersonName.trim()) {
                personName = newPersonName.trim();
                // Validate person name (only letters and spaces)
                if (!/^[a-zA-Z\s]+$/.test(personName)) {
                    alert("Person name should only contain letters and spaces.");
                    return;
                }
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
            confidence: autoLabelConfidence, // Gửi kèm confidence của AI
            manual_override: true // Đánh dấu là feedback thủ công
        };

        try {
            setProcessingImage(true); // Hiển thị trạng thái đang xử lý feedback
            setTrainingStatus('processing'); // Update UI status
            console.log("Sending feedback:", payload);

            const response = await fetch(`${BASE_BACKEND_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log("Feedback processed successfully:", result);

            setTrainingStatus('success'); // Feedback thành công
            // Tự động kích hoạt retrain nếu đạt ngưỡng (backend sẽ quyết định)
            // Backend sẽ gửi cập nhật qua Socket.IO nếu có retrain

            // Cập nhật UI và data sau khi feedback
            await Promise.all([
                fetchLatestImageInfo(), // Lấy lại thông tin ảnh để reset awaiting_feedback
                fetchKnownPeople() // Cập nhật danh sách người đã biết (nếu có người mới)
            ]);

            // Reset form
            setNewPersonName('');
            setSelectedPerson('');

            alert(`Feedback processed! ${feedbackType === 'known' ? `Added to ${personName}'s training data.` : 'Marked as unknown intruder.'}`);

        } catch (e) {
            console.error("Error sending feedback to Flask:", e);
            setTrainingStatus('error');
            alert(`Failed to process feedback: ${e.message}`);
        } finally {
            setProcessingImage(false); // Dừng hiển thị xử lý feedback
        }
    };

    // --- HÀM TỐI ƯU: Retrain model với progress tracking ---
    const retrainModel = async () => {
        if (!window.confirm("Are you sure you want to retrain the AI model? This may take several minutes.")) {
            return;
        }

        try {
            setIsTrainingModel(true); // Bắt đầu trạng thái training
            setTrainingStatus('processing'); // Update UI status

            console.log("Initiating AI model retraining...");
            const response = await fetch(`${BASE_BACKEND_URL}/retrain_model_background`, {
                method: 'POST',
                // Tăng timeout cho retrain nếu cần
                signal: AbortSignal.timeout(600000), // 10 phút timeout
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log("Retrain model response:", result);
            // setTrainingStatus('success'); // Sẽ được cập nhật qua Socket.IO
            alert(`Retrain request sent. Check logs for progress. ${result.message}`);

            // Không cần fetch lại ngay, Socket.IO sẽ báo khi xong

        } catch (e) {
            console.error("Error initiating model retraining:", e);
            setIsTrainingModel(false); // Dừng trạng thái training
            setTrainingStatus('error');
            alert(`Failed to initiate retraining: ${e.message}`);
        }
    };

    // --- useEffect TỐI ƯU: Socket.IO connection and listeners ---
    useEffect(() => {
        socket.current = io(BASE_BACKEND_URL, {
            reconnection: true,
            reconnectionAttempts: 5, // Thử lại 5 lần
            reconnectionDelay: 1000, // 1 giây delay giữa các lần thử
            timeout: 20000 // Timeout cho lần kết nối đầu tiên
        });

        socket.current.on('connect', () => {
            console.log('Connected to Flask Socket.IO');
            setFlaskError(null); // Clear error on successful connect
            setLoadingFlaskData(false); // Finished initial loading if connected
        });

        socket.current.on('disconnect', () => {
            console.log('Disconnected from Flask Socket.IO');
            setFlaskError('Disconnected from backend. Attempting to reconnect...');
        });

        socket.current.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            setFlaskError(`Socket.IO connection failed: ${error.message}. Please ensure backend is running.`);
            setLoadingFlaskData(false); // Stop loading if connection fails
        });

        // Listen for motion events from Flask (PIR)
        socket.current.on('motion_event', (data) => {
            console.log('Socket.IO: Motion event received:', data);
            setPirStatus(data.detected); // Update PIR status
            setLastMotionTime(new Date().toISOString());

            if (data.detected && pirSensorActive) { // Chỉ auto-capture nếu PIR active
                // Debounce và Queue cho PIR capture
                if (!captureQueueRef.current && !isCapturing) {
                    captureQueueRef.current = true; // Set cờ để tránh queue duplicate
                    setTimeout(async () => {
                        console.log("Socket.IO: Triggering auto-capture from motion event.");
                        await captureImageFromSensor('PIR_AUTO');
                        captureQueueRef.current = false; // Reset cờ sau khi capture
                    }, 500); // Small delay to ensure stable motion
                }
            }
        });

        // Listen for new image info (AI processing results)
        socket.current.on('new_image_info', (data) => {
            console.log('Socket.IO: New image info received:', data);
            setLatestImageInfo(data);
            setAutoLabelConfidence(data.confidence || 0);

            // Update UI feedback section based on AI prediction
            if (data.awaiting_feedback) {
                if (data.prediction && data.prediction !== "No Face Detected" && data.prediction !== "Recognition Error" && data.prediction !== "Unknown") {
                    if (knownPeople.includes(data.prediction)) {
                        setSelectedPerson(data.prediction);
                        setNewPersonName('');
                    } else {
                        setSelectedPerson('addNew');
                        setNewPersonName(data.prediction);
                    }
                } else {
                    setSelectedPerson('');
                    setNewPersonName('');
                }
                setTrainingStatus('pending_feedback');
            } else {
                setSelectedPerson('');
                setNewPersonName('');
                setTrainingStatus('success'); // Nếu không cần feedback, coi như AI đã xử lý xong
            }
        });

        // Listen for model retraining status updates
        socket.current.on('retrain_status', (data) => {
            console.log('Socket.IO: Retrain status received:', data);
            setIsTrainingModel(data.status === 'started'); // Set training flag
            if (data.status === 'completed') {
                alert(`AI Model Retraining Completed! New accuracy: ${(data.accuracy * 100).toFixed(1)}%`);
                setModelAccuracy(data.accuracy);
                fetchKnownPeople(); // Update known persons after retraining
                setTrainingStatus('success'); // Update UI status
                // Reset manual label count if backend sends it
                if (data.manual_label_count !== undefined) {
                    setManualLabelCount(data.manual_label_count);
                }
            } else if (data.status === 'failed') {
                alert(`AI Model Retraining Failed: ${data.message}`);
                setTrainingStatus('error');
            } else {
                setTrainingStatus('processing');
            }
        });

        // Listen for current system status (sent on connect)
        socket.current.on('current_status', (data) => {
            console.log('Socket.IO: Initial current status received:', data);
            // setPirStatus(data.motionDetected); // Cập nhật trạng thái PIR từ backend
            setLatestImageInfo(data.latestImageInfo);
            setIsTrainingModel(data.retrain_in_progress);
            setModelAccuracy(data.model_accuracy || null);
            setManualLabelCount(data.manual_label_count || 0);
            setRetrainThreshold(data.retrain_threshold || 50);

            // Trigger feedback UI update if needed
            if (data.latestImageInfo?.awaiting_feedback) {
                setTrainingStatus('pending_feedback');
                if (data.latestImageInfo.prediction && data.latestImageInfo.prediction !== "No Face Detected" && data.latestImageInfo.prediction !== "Recognition Error" && data.latestImageInfo.prediction !== "Unknown") {
                    if (knownPeople.includes(data.latestImageInfo.prediction)) {
                        setSelectedPerson(data.latestImageInfo.prediction);
                    } else {
                        setSelectedPerson('addNew');
                        setNewPersonName(data.latestImageInfo.prediction);
                    }
                }
            } else {
                setTrainingStatus('success'); // Nếu không cần feedback, coi như AI đã xử lý xong
            }

            setLoadingFlaskData(false); // Backend data is loaded
        });


        // Clean up on unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
            if (pirTimeoutRef.current) {
                clearTimeout(pirTimeoutRef.current);
            }
        };
    }, [captureImageFromSensor, pirSensorActive, knownPeople]); // Dependencies cho useEffect

    // Initial data fetch and webcam setup on component mount
    useEffect(() => {
        // fetchKnownPeople() và fetchLatestImageInfo() không cần thiết gọi lại ở đây
        // vì socket.io 'current_status' sẽ cung cấp dữ liệu ban đầu
        // và `fetchKnownPeople` được gọi định kỳ bởi setInterval

        // Ensure webcam is initialized
        if (cameraRef.current && !cameraRef.current.isInitialized()) { // Giả sử CameraFrame có method isInitialized()
            // Không tự động initialize webcam ở đây. Để CameraFrame tự quản lý hoặc thêm props
            // CameraFrame của bạn có thể tự init trong useEffect của nó.
            // Hoặc bạn có thể truyền một hàm initCamera từ đây xuống CameraFrame
        }

    }, []); // Empty dependency array means this runs once on mount


    // --- Loading State ---
    if (loadingFlaskData) {
        return (
            <div className="min-h-screen bg-[#ffe9c7] flex justify-center items-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading EyeShield AI System...</h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Attempting to connect to backend at {BASE_BACKEND_URL}...</p>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (flaskError) {
        return (
            <div className="min-h-screen bg-[#ffe9c7] flex flex-col justify-center items-center p-6">
                <h2 className="text-2xl font-bold text-red-600 mb-4">System Error</h2>
                <p className="text-gray-700 mb-4">{flaskError}</p>
                <p className="text-sm text-gray-600">Backend URL: {BASE_BACKEND_URL}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Lấy URL ảnh từ Flask backend
    const flaskImageUrl = latestImageInfo && latestImageInfo.filename
        ? `${BASE_BACKEND_URL}/get_image/${latestImageInfo.filename}`
        : null;

    return (
        <div className="min-h-screen bg-[#ffe9c7] p-4 sm:p-6 md:p-8">
            <div className="container mx-auto p-0">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 sm:mb-12">
                    👁️‍🗨️ EyeShield - Smart Surveillance System
                </h1>

                {/* --- CONTROL PANEL --- */}
                <div className="max-w-4xl mx-auto mb-6 bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">System Controls</h2>
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                            <button
                                onClick={() => setPirSensorActive(!pirSensorActive)}
                                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium shadow-sm transition duration-300 ${
                                    pirSensorActive ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white hover:bg-gray-500'
                                }`}
                            >
                                PIR Auto-Capture: {pirSensorActive ? 'ON' : 'OFF'}
                            </button>
                            {/* <button
                                onClick={() => setRealtimeUpdates(!realtimeUpdates)}
                                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium shadow-sm transition duration-300 ${
                                    realtimeUpdates ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white hover:bg-gray-500'
                                }`}
                            >
                                UI Updates: {realtimeUpdates ? 'FAST' : 'SLOW'}
                            </button> */}
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 disabled:opacity-50 shadow-sm transition duration-300"
                                onClick={retrainModel}
                                disabled={isTrainingModel || processingImage}
                            >
                                {isTrainingModel ? '⏳ Training AI...' : '🧠 Retrain AI Model'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SYSTEM STATUS INDICATORS --- */}
                <div className="max-w-4xl mx-auto mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                            <h3 className="font-semibold text-blue-800 text-xs sm:text-sm mb-1">Model Accuracy</h3>
                            <p className="text-xl sm:text-3xl font-bold text-blue-600">
                                {modelAccuracy ? `${(modelAccuracy * 100).toFixed(1)}%` : 'N/A'}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg flex flex-col items-center justify-center">
                            <h3 className="font-semibold text-green-800 text-xs sm:text-sm mb-1">Known Persons</h3>
                            <p className="text-xl sm:text-3xl font-bold text-green-600">{knownPeople.length}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg flex flex-col items-center justify-center">
                            <h3 className="font-semibold text-indigo-800 text-xs sm:text-sm mb-1">Manual Labels for Retrain</h3>
                            <p className="text-xl sm:text-3xl font-bold text-indigo-600">
                                {manualLabelCount}/{retrainThreshold}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg flex flex-col items-center justify-center">
                            <h3 className="font-semibold text-purple-800 text-xs sm:text-sm mb-1">System Status</h3>
                            <p className={`text-xl sm:text-3xl font-bold ${processingImage || isTrainingModel ? 'text-yellow-600' : 'text-green-600'}`}>
                                {isTrainingModel ? 'TRAINING' : processingImage ? 'PROCESSING' : 'READY'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- PIR AND WEBCAM SECTION --- */}
                <div className="max-w-4xl mx-auto mb-8 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Live Surveillance Feed</h3>

                    {/* PIR Status with more detail */}
                    <div className={`mb-6 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center transition-colors duration-300 ${pirStatus ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`}>
                        <p className="text-lg font-medium flex items-center mb-2 sm:mb-0">
                            {pirStatus ? (
                                <span className="animate-pulse mr-2 text-xl">🚨</span>
                            ) : (
                                <span className="mr-2 text-xl">✅</span>
                            )}
                            PIR Motion Sensor:
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${pirStatus ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
                                {pirStatus ? 'MOTION DETECTED!' : 'ALL CLEAR'}
                            </span>
                        </p>
                        {lastMotionTime && (
                            <p className="text-xs sm:text-sm text-gray-600">
                                Last Motion: {new Date(lastMotionTime).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Webcam with status indicator */}
                    <div className="webcam-section">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold">Camera Feed</h4>
                            <div className="flex items-center gap-2">
                                {isCapturing && (
                                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg animate-pulse">
                                        📸 Capturing...
                                    </span>
                                )}
                                {processingImage && (
                                    <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg animate-pulse">
                                        🤖 AI Processing...
                                    </span>
                                )}
                            </div>
                        </div>

                        <CameraFrame
                            ref={cameraRef}
                            isCapturing={isCapturing}
                            onCapture={captureImageManual} // Gọi hàm captureManual để xử lý
                            disabled={isCapturing || processingImage || isTrainingModel}
                        />

                        <div className="mt-4 text-sm text-gray-700 space-y-1">
                            <p>• Automatic Capture (PIR): {pirSensorActive ? 'Enabled, captures on motion detection (min 10s interval).' : 'Disabled. Enable via "PIR Auto-Capture" button.'}</p>
                            <p>• Manual Capture: Always available. Analyzed by AI and used for training.</p>
                            <p>• Registered Individuals: {knownPeople.length} people in the system.</p>
                        </div>
                    </div>
                </div>

                {/* --- AI DETECTION RESULTS SECTION --- */}
                <div className="max-w-4xl mx-auto mb-12 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">Latest AI Detection & Feedback</h3>
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            trainingStatus === 'success' ? 'bg-green-100 text-green-800' :
                            trainingStatus === 'pending_feedback' ? 'bg-yellow-100 text-yellow-800' :
                            trainingStatus === 'processing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            trainingStatus === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            AI Status: {trainingStatus.toUpperCase().replace('_', ' ')}
                        </span>
                    </div>

                    {latestImageInfo && latestImageInfo.status === 'success' && flaskImageUrl ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="image-display">
                                <div className="relative w-full max-w-sm mx-auto">
                                    <img
                                        src={flaskImageUrl}
                                        alt="Latest AI Detection"
                                        className="w-full rounded-lg shadow-md cursor-pointer border border-gray-200"
                                        onClick={() => setSelectedImage(flaskImageUrl)}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/path/to/placeholder-image.png'; // Fallback image
                                            console.error("Failed to load image from Flask backend. Check URL and backend server.");
                                        }}
                                    />
                                    {processingImage && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                            <div className="text-white text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                                <p className="text-sm">AI Processing...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mt-3 text-center">
                                    Captured: {new Date(latestImageInfo.timestamp).toLocaleString()}
                                </p>
                            </div>

                            <div className="analysis-feedback-section space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="font-bold text-lg text-gray-800 mb-2">AI Prediction:</h4>
                                    <p className={`text-xl font-semibold ${
                                        latestImageInfo.awaiting_feedback ? 'text-orange-700' :
                                        latestImageInfo.prediction === 'Unknown' ? 'text-red-700' :
                                        'text-green-700'
                                    }`}>
                                        {latestImageInfo.prediction || 'No prediction yet'}
                                    </p>
                                    {autoLabelConfidence > 0 && (
                                        <p className="text-gray-700 text-sm mt-1">
                                            Confidence: {(autoLabelConfidence * 100).toFixed(1)}%
                                        </p>
                                    )}
                                </div>

                                {latestImageInfo.awaiting_feedback ? (
                                    <div className="feedback-form p-5 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
                                        <h4 className="text-xl font-bold text-yellow-800 mb-4">Manual Labeling Required!</h4>
                                        <p className="text-sm text-yellow-700 mb-4">The AI needs your help to identify this person. Your feedback trains the model!</p>

                                        <div className="space-y-4">
                                            {/* Mark as Unknown */}
                                            <button
                                                onClick={() => sendFeedback('unknown')}
                                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition duration-300"
                                                disabled={processingImage || isTrainingModel}
                                            >
                                                🚨 Mark as Unknown Intruder
                                            </button>

                                            <div className="relative">
                                                <label htmlFor="selectPerson" className="block text-gray-700 text-sm font-bold mb-2">
                                                    Is this a known person?
                                                </label>
                                                <select
                                                    id="selectPerson"
                                                    value={selectedPerson}
                                                    onChange={(e) => {
                                                        setSelectedPerson(e.target.value);
                                                        if (e.target.value !== 'addNew') {
                                                            setNewPersonName('');
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                    disabled={processingImage || isTrainingModel}
                                                >
                                                    <option value="">-- Select or Add New --</option>
                                                    {knownPeople.map(person => (
                                                        <option key={person} value={person}>👤 {person}</option>
                                                    ))}
                                                    <option value="addNew">➕ Add New Person</option>
                                                </select>
                                            </div>

                                            {selectedPerson === 'addNew' && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter new person's name (e.g., Jane Doe)"
                                                    value={newPersonName}
                                                    onChange={(e) => setNewPersonName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                    disabled={processingImage || isTrainingModel}
                                                />
                                            )}

                                            <button
                                                onClick={() => sendFeedback('known')}
                                                disabled={!selectedPerson || (selectedPerson === 'addNew' && !newPersonName.trim()) || processingImage || isTrainingModel}
                                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition duration-300"
                                            >
                                                {processingImage ? '⏳ Processing...' : '✅ Label as Known Person'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-green-800 text-sm font-semibold">
                                            ✅ AI has automatically processed this detection. System is ready for the next capture.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-2">📷 No recent AI detections to display.</p>
                            <p className="text-sm text-gray-500">System is monitoring for motion or awaiting manual capture.</p>
                        </div>
                    )}
                </div>

                {/* --- FIREBASE DETECTIONS LIST (Nếu bạn vẫn dùng Firebase) --- */}
                <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Pending Detections (Firebase)</h3>
                    {notifications.length > 0 ? (
                        <DetectionList detections={notifications} classifyPerson={classifyPersonFirebase} />
                    ) : (
                        <p className="text-gray-600 text-center py-4">No pending detections in Firebase.</p>
                    )}
                </div>

                {/* --- IMAGE MODAL --- */}
                {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
            </div>
        </div>
    );
};

export default Home;