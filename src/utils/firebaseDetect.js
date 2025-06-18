import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';

const COLLECTION = 'detect_history';

// Thêm một detect mới vào Firestore
export async function addDetect(detect) {
  await addDoc(collection(db, COLLECTION), detect);
}

// Lấy tất cả detect
export async function getAllDetects() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy dữ liệu Firestore:', error);
    return [];
  }
}

// Lấy 3 detect gần nhất (cho trang Home)
export async function getRecentDetects() {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Cập nhật detect theo ID
export async function updateDetect(id, updates) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, updates);
}

// Lắng nghe thay đổi realtime (cho cả Home và History)
export function listenToDetects(callback) {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
}
