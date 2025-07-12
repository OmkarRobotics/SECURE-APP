import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getAllLessons } from '../../lib/LessonBank';
export default function LessonsScreen() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    getAllLessons().then(setLessons);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {lessons.length === 0 ? (
        <Text>Loading lessons...</Text>
      ) : (
        lessons.map((lesson) => (
          <View key={lesson.id} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{lesson.title}</Text>
            <Text style={{ color: '#666' }}>Level: {lesson.level}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
