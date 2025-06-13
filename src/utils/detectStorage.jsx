// src/utils/detectStorage.js

const STORAGE_KEY = 'detect_history';

// Thêm detect mới vào localStorage
export function addDetect(detect) {
  const history = getAllDetects();
  history.unshift(detect); // Thêm vào đầu để có dữ liệu mới nhất
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100))); // Giới hạn 100 detect
}

// Lấy tất cả detect đã lưu
export function getAllDetects() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Lấy 3 detect gần nhất
export function getRecentDetects() {
  return getAllDetects().slice(0, 3);
}

// Cập nhật một detect theo ID
export function updateDetect(id, updates) {
    let history = getAllDetects();
    history = history.map(detect => 
        detect.id === id ? { ...detect, ...updates } : detect
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}