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
  onSnapshot
} from 'firebase/firestore';

const COLLECTION = 'detect_history';

export async function addDetect(detect) {
  await addDoc(collection(db, COLLECTION), detect);
}

export async function getAllDetects() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRecentDetects() {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateDetect(id, updates) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, updates);
}
