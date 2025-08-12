// app/(tabs)/home.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { getAllLessons } from '../../lib/LessonBank'

// Define interfaces for better type safety
interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  level: number;
  order: number;
  icon?: string;
  type?: string;
  color?: string;
  lessonId?: string;
}

interface PathItem {
  icon: string;
  type: string;
  color: string;
  title: string;
  lessonId?: string;
  completed?: boolean;
  level?: number;
  order?: number;
}

export default function Home() {
  const { width: screenWidth } = Dimensions.get('window')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  // Load lessons from Firebase
  useEffect(() => {
    const loadLessons = async () => {
      try {
        const fetchedLessons = await getAllLessons()
        setLessons(fetchedLessons)
      } catch (error) {
        console.error('Error loading lessons:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLessons()
  }, [])

  const defaultLearningPath: PathItem[] = [
    { icon: "calculator", type: "MaterialIcons", color: "#2D9B8B", title: "Basic Math" },
    { icon: "access-time", type: "MaterialIcons", color: "#2D9B8B", title: "Time & Money" },
    { icon: "balance", type: "FontAwesome5", color: "#2D9B8B", title: "Financial Balance" },
    { icon: "credit-card", type: "MaterialIcons", color: "#2D9B8B", title: "Credit Basics" },
    { icon: "phone-android", type: "MaterialIcons", color: "#2D9B8B", title: "Mobile Banking" },
    { icon: "lightbulb", type: "MaterialIcons", color: "#2D9B8B", title: "Smart Spending" },
    { icon: "attach-money", type: "MaterialIcons", color: "#2D9B8B", title: "Income Basics" },
    { icon: "payment", type: "MaterialIcons", color: "#2D9B8B", title: "Payment Methods" },
    { icon: "account-balance", type: "MaterialIcons", color: "#2D9B8B", title: "Banking Basics" },
    { icon: "trending-up", type: "MaterialIcons", color: "#2D9B8B", title: "Investment Intro" },
    { icon: "security", type: "MaterialIcons", color: "#2D9B8B", title: "Financial Security" },
    { icon: "show-chart", type: "MaterialIcons", color: "#2D9B8B", title: "Growth Planning" },
  ]

  // Merge Firebase lessons with default path data
  const learningPathItems = defaultLearningPath.map((pathItem, index) => {
    const firebaseLesson = lessons.find(lesson => lesson.order === index + 1) || lessons[index]
    return {
      ...pathItem,
      ...firebaseLesson,
      lessonId: firebaseLesson?.id || `lesson_${index + 1}`,
      title: firebaseLesson?.title || pathItem.title,
      completed: firebaseLesson?.completed || false,
      level: firebaseLesson?.level || 1,
      order: index + 1
    }
  })

  // Function to handle lesson press
  const handleLessonPress = (lesson: any, index: number) => {
    // Check if lesson is unlocked (previous lessons completed or it's the first lesson)
    const isUnlocked = index === 0 || learningPathItems[index - 1]?.completed
    
    if (!isUnlocked) {
      // Show locked lesson feedback
      Alert.alert('Lesson Locked', 'Complete the previous lesson to unlock this one!')
      return
    }

    // Navigate to lesson screen
    router.push({
      pathname: '/LessonDetail' as any,
      params: {
        lessonId: lesson.lessonId || `lesson_${index + 1}`,
        lessonTitle: lesson.title,
        lessonIcon: lesson.icon,
        lessonType: lesson.type,
        lessonLevel: String(lesson.level || 1),
        lessonData: JSON.stringify(lesson)
      }
    })
  }

  // Creating continuous zigzag path
  const getContinuousPathPosition = (index: number) => {
    const centerX = screenWidth / 2
    const verticalSpacing = 100
    const horizontalAmplitude = Math.min(100, screenWidth * 0.25)
    
    const zigzagCycle = 6
    const cyclePosition = index % zigzagCycle
    const cycleNumber = Math.floor(index / zigzagCycle)
    
    let x: number
    
    switch (cyclePosition) {
      case 0:
        x = centerX - horizontalAmplitude / 2
        break
      case 1:
        x = centerX - horizontalAmplitude
        break
      case 2:
        x = centerX - horizontalAmplitude * 0.7
        break
      case 3:
        x = centerX + horizontalAmplitude / 2
        break
      case 4:
        x = centerX + horizontalAmplitude
        break
      case 5:
        x = centerX + horizontalAmplitude * 0.7
        break
      default:
        x = centerX
    }
    
    const y = 50 + index * verticalSpacing + cycleNumber * 20
    return { left: x - 25, top: y } // Subtract 25 to center the 50px wide circles
  }

  const getIconComponent = (type: string) => {
    switch (type) {
      case "MaterialIcons":
        return MaterialIcons
      case "FontAwesome5":
        return FontAwesome5
      case "Ionicons":
        return Ionicons
      default:
        return MaterialIcons
    }
  }

  const renderIcon = (item: any, index: number) => {
    const IconComponent = getIconComponent(item.type)
    const position = getContinuousPathPosition(index)
    
    // Determine lesson state
    const isCompleted = item.completed
    const isUnlocked = index === 0 || learningPathItems[index - 1]?.completed
    const isLocked = !isUnlocked
    const isCurrent = !isCompleted && isUnlocked

    return (
      <View key={`lesson-${index}`} style={[styles.pathItemContainer, { left: position.left, top: position.top }]}>
        <TouchableOpacity
          style={[
            styles.pathItem,
            {
              backgroundColor: isCompleted 
                ? "#4CAF50" 
                : isLocked 
                  ? "#CCCCCC" 
                  : isCurrent
                    ? "#FF6B35" // Highlight current lesson
                    : "#2D9B8B",
              opacity: isLocked ? 0.6 : 1,
              transform: isCurrent ? [{ scale: 1.1 }] : [{ scale: 1 }],
            },
          ]}
          onPress={() => handleLessonPress(item, index)}
          disabled={isLocked}
          activeOpacity={0.7}
        >
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check" size={16} color="white" />
            </View>
          )}
          {isLocked ? (
            <MaterialIcons name="lock" size={24} color="white" />
          ) : (
            <IconComponent name={item.icon as any} size={24} color="white" />
          )}
        </TouchableOpacity>
        
        {/* Lesson title below circle */}
        <Text style={[
          styles.lessonTitle,
          { color: isLocked ? "#999" : "#333" }
        ]}>
          {item.title}
        </Text>
        
        {/* Level indicator */}
        {item.level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{item.level}</Text>
          </View>
        )}
      </View>
    )
  }

  const handleHedgehogPress = () => {
    Alert.alert('Quick Tip!', 'Complete lessons in order to unlock new content and earn rewards!')
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const completedLessons = learningPathItems.filter(item => item.completed).length
  const totalLessons = learningPathItems.length

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>SECURE</Text>

        <View style={styles.headerRight}>
          <View style={styles.flameContainer}>
            <Ionicons name="flame" size={20} color="#FF6B35" />
            <Text style={styles.flameText}>123</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profilePlaceholder}>
              <MaterialIcons name="person" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Module Card */}
        <View style={styles.moduleCard}>
          <Text style={styles.moduleSubtitle}>MODULE 1, UNIT 1</Text>
          <Text style={styles.moduleTitle}>Budgeting Basics</Text>
          <Text style={styles.progressText}>
            {completedLessons} of {totalLessons} lessons completed
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${(completedLessons / totalLessons) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Learning Path */}
        <View style={styles.pathContainer}>
          {/* Hedgehog Character */}
          <TouchableOpacity 
            style={styles.hedgehogContainer}
            onPress={handleHedgehogPress}
          >
            <View style={styles.hedgehogPlaceholder}>
              <MaterialIcons name="pets" size={40} color="#2D9B8B" />
            </View>
            <Text style={styles.hedgehogText}>Tap for quick tips!</Text>
          </TouchableOpacity>

          {/* Path Items */}
          <View style={styles.pathItems}>
            {learningPathItems.map((item, index) => renderIcon(item, index))}
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  flameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  flameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  moduleCard: {
    backgroundColor: "#2D9B8B",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  moduleSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
    letterSpacing: 1,
  },
  moduleTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 15,
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 4,
  },
  pathContainer: {
    flex: 1,
    position: "relative",
    minHeight: 1400,
  },
  hedgehogContainer: {
    position: "absolute",
    left: 20,
    top: 50,
    alignItems: "center",
    zIndex: 10,
  },
  hedgehogPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(45, 155, 139, 0.1)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  hedgehogText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    maxWidth: 80,
  },
  pathItems: {
    flex: 1,
    paddingTop: 20,
    position: "relative",
  },
  pathItemContainer: {
    position: "absolute",
    alignItems: "center",
    width: 70,
  },
  pathItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2D9B8B",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  completedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    zIndex: 1,
  },
  lessonTitle: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 70,
    fontWeight: "500",
    lineHeight: 12,
  },
  levelBadge: {
    backgroundColor: "#666",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "center",
  },
  levelText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 100,
  },
})