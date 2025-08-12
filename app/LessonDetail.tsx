import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { updateLessonProgress, updateUserProgress } from '../lib/LessonProgressManager'
import { getQuizById } from '../lib/QuizManager'

// Define interfaces for better type safety
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

interface LessonStep {
  type: 'intro' | 'content' | 'quiz';
  title: string;
  content: string;
  points?: string[];
  example?: string;
}

export default function LessonDetail() {
  const params = useLocalSearchParams()
  const { lessonId, lessonTitle, lessonIcon, lessonType, lessonLevel, lessonData } = params
  
  // Parse the lesson data if it was stringified
  const parsedLessonData = lessonData ? JSON.parse(lessonData as string) : null
  
  const [currentStep, setCurrentStep] = useState(0)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [lessonCompleted, setLessonCompleted] = useState(false)

  // Load associated quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // Try to find quiz by lesson ID or a related quiz ID
        const quizData = await getQuizById(parsedLessonData?.quizId || 'quiz1')
        setQuiz(quizData)
      } catch (error) {
        console.error('Error loading quiz:', error)
      }
    }
    loadQuiz()
  }, [lessonId, parsedLessonData])

  // Get the appropriate icon component
  const getIconComponent = () => {
    switch (lessonType) {
      case "MaterialIcons":
        return MaterialIcons
      case "FontAwesome5":
        return FontAwesome5
      case "FontAwesome":
        return FontAwesome5
      default:
        return Ionicons
    }
  }

  const IconComponent = getIconComponent()

  // Lesson content steps
  const lessonSteps: LessonStep[] = [
    {
      type: 'intro',
      title: lessonTitle as string,
      content: parsedLessonData?.content || `Welcome to ${lessonTitle}! In this lesson, you'll learn the fundamentals of personal finance and how to make smart financial decisions.`,
      points: parsedLessonData?.keyPoints || [
        'Understanding basic financial concepts',
        'Learning practical money management skills',
        'Building confidence in financial decisions'
      ]
    },
    {
      type: 'content',
      title: 'Key Concepts',
      content: parsedLessonData?.detailedContent || 'This lesson covers essential financial literacy topics that will help you manage your money effectively and make informed financial decisions.',
      example: parsedLessonData?.example || 'For example, creating a budget helps you track income and expenses, ensuring you spend less than you earn.'
    },
    {
      type: 'quiz',
      title: 'Knowledge Check',
      content: 'Test your understanding with this quick quiz!'
    }
  ]

  const handleNext = () => {
    if (currentStep < lessonSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === lessonSteps.length - 1 && !showResults) {
      // If on quiz step, handle quiz completion
      handleQuizCompletion()
    } else {
      // Complete lesson and return to home
      completeLessonAndReturn()
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer', 'Choose an option before continuing.')
      return
    }

    const newUserAnswers = [...userAnswers]
    const currentQuestionIndex = newUserAnswers.length
    newUserAnswers.push(selectedAnswer)
    setUserAnswers(newUserAnswers)
    setSelectedAnswer(null)

    // Check if this was the last question
    if (quiz && quiz.questions && currentQuestionIndex === quiz.questions.length - 1) {
      handleQuizCompletion()
    }
  }

  const handleQuizCompletion = () => {
    setShowResults(true)
    // Calculate score
    if (quiz && quiz.questions) {
      const correctAnswers = userAnswers.filter((answer, index) => 
        answer === quiz.questions[index]?.correctAnswer
      ).length
      const score = (correctAnswers / quiz.questions.length) * 100
      
      if (score >= 70) {
        setLessonCompleted(true)
      }
    }
  }

  const completeLessonAndReturn = async () => {
    try {
      // Calculate final score if quiz was taken
      let finalScore: number | undefined = undefined
      if (quiz && quiz.questions && userAnswers.length > 0) {
        const correctAnswers = userAnswers.filter((answer, index) => 
          answer === quiz.questions[index]?.correctAnswer
        ).length
        finalScore = (correctAnswers / quiz.questions.length) * 100
      }

      // Update lesson completion in Firebase
      await updateLessonProgress(
        parsedLessonData?.id || lessonId as string, 
        true, 
        finalScore
      )
      
      // Update user progress
      const points = finalScore !== undefined && finalScore >= 70 ? 15 : 10 // Bonus points for good performance
      await updateUserProgress(
        'default_user', 
        parsedLessonData?.id || lessonId as string, 
        points
      )
      
      Alert.alert(
        'Lesson Complete!', 
        `Congratulations! You've completed ${lessonTitle} and earned ${points} points!`,
        [{ text: 'Continue', onPress: () => router.back() }]
      )
    } catch (error) {
      console.error('Error completing lesson:', error)
      Alert.alert(
        'Lesson Complete!', 
        `Congratulations! You've completed ${lessonTitle}.`,
        [{ text: 'Continue', onPress: () => router.back() }]
      )
    }
  }

  const getCurrentQuizQuestion = (): QuizQuestion | null => {
    if (!quiz || !quiz.questions) return null
    return quiz.questions[userAnswers.length] || null
  }

  const renderIntroStep = (step: LessonStep) => (
    <View style={styles.stepContent}>
      <View style={styles.lessonHeader}>
        <View style={styles.iconContainer}>
          <IconComponent name={lessonIcon as any} size={40} color="white" />
        </View>
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{step.title}</Text>
          <Text style={styles.lessonLevel}>Level {lessonLevel}</Text>
        </View>
      </View>
      
      <Text style={styles.contentText}>{step.content}</Text>
      
      {step.points && (
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsTitle}>What you'll learn:</Text>
          {step.points.map((point: string, index: number) => (
            <View key={index} style={styles.pointItem}>
              <MaterialIcons name="check-circle" size={16} color="#2D9B8B" />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  const renderContentStep = (step: LessonStep) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.contentText}>{step.content}</Text>
      
      {step.example && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>💡 Example</Text>
          <Text style={styles.exampleText}>{step.example}</Text>
        </View>
      )}
    </View>
  )

  const renderQuizStep = (step: LessonStep) => {
    const currentQuestion = getCurrentQuizQuestion()
    
    if (showResults) {
      const correctAnswers = quiz && quiz.questions ? userAnswers.filter((answer, index) => 
        answer === quiz.questions[index]?.correctAnswer
      ).length : 0
      const score = quiz && quiz.questions ? (correctAnswers / quiz.questions.length) * 100 : 0
      const passed = score >= 70

      return (
        <View style={styles.stepContent}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Quiz Results</Text>
            <View style={[styles.scoreContainer, { backgroundColor: passed ? '#4CAF50' : '#FF6B35' }]}>
              <Text style={styles.scoreText}>{Math.round(score)}%</Text>
            </View>
            <Text style={styles.resultsText}>
              {passed 
                ? '🎉 Great job! You passed the quiz.' 
                : '📚 Review the lesson and try again.'}
            </Text>
            <Text style={styles.answersText}>
              {correctAnswers} out of {quiz?.questions?.length || 0} correct
            </Text>
          </View>
        </View>
      )
    }

    if (!currentQuestion) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.contentText}>{step.content}</Text>
          {!quiz && <Text style={styles.noQuizText}>No quiz available for this lesson.</Text>}
        </View>
      )
    }

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Question {userAnswers.length + 1} of {quiz.questions.length}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, selectedAnswer === null && styles.disabledButton]}
          onPress={handleQuizSubmit}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.submitButtonText}>
            {userAnswers.length === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderCurrentStep = () => {
    const step = lessonSteps[currentStep]
    
    switch (step.type) {
      case 'intro':
        return renderIntroStep(step)
      case 'content':
        return renderContentStep(step)
      case 'quiz':
        return renderQuizStep(step)
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / lessonSteps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {lessonSteps.length}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === lessonSteps.length - 1 && showResults 
              ? 'Complete Lesson' 
              : currentStep === lessonSteps.length - 1 
                ? 'Take Quiz' 
                : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 5,
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2D9B8B",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  helpButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingVertical: 20,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2D9B8B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  lessonLevel: {
    fontSize: 14,
    color: "#666",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 20,
  },
  pointsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pointText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  exampleContainer: {
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    padding: 15,
    borderRadius: 5,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    borderColor: "#2D9B8B",
    backgroundColor: "#F0F9F7",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#2D9B8B",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#2D9B8B",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  scoreContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  resultsText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  answersText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  noQuizText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
  },
  bottomNav: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  nextButton: {
    backgroundColor: "#2D9B8B",
    borderRadius: 25,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})