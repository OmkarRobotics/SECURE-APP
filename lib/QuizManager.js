import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const getQuizById = async (quizId) => {
  try {
    const docRef = doc(db, 'quizzes', quizId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn('⚠️ No quiz found for ID:', quizId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading quiz:', error);
    return null;
  }
};
