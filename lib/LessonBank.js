import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const getAllLessons = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'lessons'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('❌ Error loading lessons:', error);
    return [];
  }
};
