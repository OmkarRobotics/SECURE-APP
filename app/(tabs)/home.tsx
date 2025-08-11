import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Home() {
  const screenWidth = 375 // Standard mobile width for consistent layout

  const learningPathItems = [
    { icon: "calculator", type: "MaterialIcons", color: "#2D9B8B" },
    { icon: "clock-o", type: "FontAwesome", color: "#2D9B8B" },
    { icon: "balance-scale", type: "FontAwesome5", color: "#2D9B8B" },
    { icon: "credit-card", type: "MaterialIcons", color: "#2D9B8B" },
    { icon: "phone-android", type: "MaterialIcons", color: "#2D9B8B" },
    { icon: "lightbulb-o", type: "FontAwesome", color: "#2D9B8B" },
    { icon: "dollar", type: "FontAwesome", color: "#2D9B8B" },
    { icon: "credit-card", type: "MaterialIcons", color: "#2D9B8B" },
    { icon: "bank", type: "FontAwesome", color: "#2D9B8B" },
    { icon: "trending-up", type: "MaterialIcons", color: "#2D9B8B" },
    { icon: "shield", type: "FontAwesome", color: "#2D9B8B" },
    { icon: "chart-line", type: "FontAwesome5", color: "#2D9B8B" },
  ]

  // Creating continuous zigzag path instead of separate triangles
  const getContinuousPathPosition = (index: number) => {
    const centerX = screenWidth / 2
    const verticalSpacing = 80 // Space between each circle vertically
    const horizontalAmplitude = 100 // How far left/right the zigzag goes
    
    // Create a smooth zigzag pattern
    const zigzagCycle = 6 // Number of circles per complete zigzag cycle
    const cyclePosition = index % zigzagCycle
    const cycleNumber = Math.floor(index / zigzagCycle)
    
    let x, y
    
    // Define the zigzag pattern positions within each cycle
    switch (cyclePosition) {
      case 0: // Start from center-left
        x = centerX - horizontalAmplitude / 2
        break
      case 1: // Move further left
        x = centerX - horizontalAmplitude
        break
      case 2: // Peak left, start moving right
        x = centerX - horizontalAmplitude * 0.7
        break
      case 3: // Center-right
        x = centerX + horizontalAmplitude / 2
        break
      case 4: // Move further right
        x = centerX + horizontalAmplitude
        break
      case 5: // Peak right, start moving left
        x = centerX + horizontalAmplitude * 0.7
        break
      default:
        x = centerX
    }
    
    y = 50 + index * verticalSpacing + cycleNumber * 20 // Add slight vertical offset per cycle
    
    return { left: x, top: y }
  }

  const renderIcon = (item: any, index: number) => {
    const IconComponent =
      item.type === "MaterialIcons"
        ? MaterialIcons
        : item.type === "FontAwesome5"
          ? FontAwesome5
          : item.type === "FontAwesome"
            ? FontAwesome5
            : Ionicons

    // Using continuous path positioning instead of triangle groups
    const position = getContinuousPathPosition(index)

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.pathItem,
          {
            position: "absolute",
            left: position.left,
            top: position.top,
          },
        ]}
      >
        <IconComponent name={item.icon} size={24} color="white" />
      </TouchableOpacity>
    )
  }

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
            <Image source={{ uri: "/diverse-profile-avatars.png" }} style={styles.profileImage} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Module Card */}
        <View style={styles.moduleCard}>
          <Text style={styles.moduleSubtitle}>MODULE 1, UNIT 1</Text>
          <Text style={styles.moduleTitle}>Budgeting Basics</Text>
        </View>

        {/* Learning Path */}
        <View style={styles.pathContainer}>
          {/* Hedgehog Character */}
          <View style={styles.hedgehogContainer}>
            <Image source={{ uri: "/cartoon-hedgehog-glasses-mascot.png" }} style={styles.hedgehogImage} />
            <Text style={styles.hedgehogText}>Tap for quick tips/reminders</Text>
          </View>

          {/* Path Items */}
          <View style={styles.pathItems}>{learningPathItems.map((item, index) => renderIcon(item, index))}</View>

          {/* Bottom Hedgehog */}
          <View style={styles.bottomHedgehog}>
            <Image source={{ uri: "/cartoon-hedgehog-mascot-bottom.png" }} style={styles.bottomHedgehogImage} />
          </View>
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
  profileImage: {
    width: "100%",
    height: "100%",
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
  },
  pathContainer: {
    flex: 1,
    position: "relative",
    minHeight: 1000, // Adjusted height for continuous path
  },
  hedgehogContainer: {
    position: "absolute",
    left: 20,
    top: 100,
    alignItems: "center",
    zIndex: 10,
  },
  hedgehogImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
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
  bottomHedgehog: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  bottomHedgehogImage: {
    width: 60,
    height: 60,
  },
})