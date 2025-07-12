import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getQuizById } from '../../lib/QuizManager'; // Adjusted path if you're using (tabs)

export default function QuestionsScreen() {
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    getQuizById('quiz1').then(setQuiz);
  }, []);

  if (!quiz) return <Text style={{ padding: 16 }}>Loading quiz...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{quiz.title}</Text>
      {quiz.questions.map((q, index) => (
        <View key={index} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16 }}>{index + 1}. {q.question}</Text>
          {q.options.map((option, i) => (
            <Text key={i} style={{ paddingLeft: 10, color: '#444' }}>• {option}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
