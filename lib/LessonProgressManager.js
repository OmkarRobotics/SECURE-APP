import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const updateLessonProgress = async (lessonId, completed = true, score = null) => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    
    // Update the lesson document with completion status
    await updateDoc(lessonRef, {
      completed: completed,
      completedAt: completed ? new Date() : null,
      lastScore: score
    });
    
    console.log('Lesson progress updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    
    // If the document doesn't exist, create it
    if (error.code === 'not-found') {
      try {
        await setDoc(lessonRef, {
          id: lessonId,
          completed: completed,
          completedAt: completed ? new Date() : null,
          lastScore: score
        });
        console.log('Lesson document created and progress updated');
        return true;
      } catch (createError) {
        console.error('Error creating lesson document:', createError);
        return false;
      }
    }
    return false;
  }
};

export const getLessonProgress = async (lessonId) => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);
    
    if (lessonSnap.exists()) {
      return lessonSnap.data();
    } else {
      console.log('No lesson progress found for:', lessonId);
      return null;
    }
  } catch (error) {
    console.error('Error getting lesson progress:', error);
    return null;
  }
};

export const getUserProgress = async (userId = 'default_user') => {
  try {
    const progressRef = doc(db, 'user_progress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return progressSnap.data();
    } else {
      // Create initial progress document
      const initialProgress = {
        userId: userId,
        totalLessonsCompleted: 0,
        currentStreak: 0,
        totalPoints: 0,
        lastActivityDate: null,
        completedLessons: []
      };
      
      await setDoc(progressRef, initialProgress);
      return initialProgress;
    }
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

export const updateUserProgress = async (userId = 'default_user', lessonId, points = 10) => {
  try {
    const progressRef = doc(db, 'user_progress', userId);
    const currentProgress = await getUserProgress(userId);
    
    if (!currentProgress) return false;
    
    const updatedProgress = {
      ...currentProgress,
      totalLessonsCompleted: currentProgress.totalLessonsCompleted + 1,
      totalPoints: currentProgress.totalPoints + points,
      lastActivityDate: new Date(),
      completedLessons: [...(currentProgress.completedLessons || []), lessonId],
      // Update streak logic could be added here
      currentStreak: currentProgress.currentStreak + 1
    };
    
    await updateDoc(progressRef, updatedProgress);
    console.log('User progress updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    return false;
  }
};