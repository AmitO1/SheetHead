import { View, Text, StyleSheet, Dimensions } from "react-native"
import { BlurView } from "expo-blur"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  interpolate,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")
const isTablet = width >= 768

interface DraggableCardProps {
  value?: string
  suit?: string
  color?: "red" | "black"
  faceDown?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  isSelected?: boolean
  onPress?: () => void
  onDragStart?: () => void
  onDragEnd?: (x: number, y: number) => void
  isDragging?: boolean
}

export function DraggableCard({
  value,
  suit,
  color = "black",
  faceDown = false,
  size = "md",
  isSelected = false,
  onPress,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: DraggableCardProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scale = useSharedValue(1)
  const rotation = useSharedValue(0)

  const sizes = {
    xs: { width: isTablet ? 44 : 28, height: isTablet ? 60 : 40 },
    sm: { width: isTablet ? 64 : 40, height: isTablet ? 88 : 56 },
    md: { width: isTablet ? 80 : 56, height: isTablet ? 112 : 80 },
    lg: { width: isTablet ? 104 : 72, height: isTablet ? 144 : 96 },
  }

  const cardSize = sizes[size]

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1)
      rotation.value = withSpring(5)
      if (onDragStart) {
        runOnJS(onDragStart)()
      }
    })
    .onUpdate((event) => {
      translateX.value = event.translationX
      translateY.value = event.translationY
    })
    .onEnd((event) => {
      scale.value = withSpring(1)
      rotation.value = withSpring(0)
      if (onDragEnd) {
        runOnJS(onDragEnd)(event.absoluteX, event.absoluteY)
      }
      // Reset position
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
    })

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)()
      }
    })

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      zIndex: isDragging ? 1000 : 1,
    }
  })

  const content = faceDown ? (
    <BlurView intensity={40} style={[styles.card, cardSize, styles.faceDownCard]}>
      <View style={styles.faceDownPattern}>
        <View style={styles.patternBorder1} />
        <View style={styles.patternBorder2} />
      </View>
      <Text style={[styles.faceDownIcon, size === "xs" && styles.faceDownIconSmall]}>♠</Text>
    </BlurView>
  ) : (
    <BlurView intensity={40} style={[styles.card, cardSize, styles.faceUpCard, isSelected && styles.selectedCard]}>
      <View style={[styles.topLeft, size === "xs" && styles.topLeftSmall]}>
        <Text
          style={[
            styles.valueText,
            color === "red" ? styles.redText : styles.blackText,
            size === "xs" && styles.valueTextXs,
            size === "sm" && styles.valueTextSm,
          ]}
        >
          {value}
        </Text>
        <Text
          style={[
            styles.suitText,
            color === "red" ? styles.redText : styles.blackText,
            size === "xs" && styles.suitTextXs,
            size === "sm" && styles.suitTextSm,
          ]}
        >
          {suit}
        </Text>
      </View>

      <View style={styles.center}>
        <Text
          style={[
            styles.centerSuit,
            color === "red" ? styles.redText : styles.blackText,
            size === "xs" && styles.centerSuitXs,
            size === "sm" && styles.centerSuitSm,
          ]}
        >
          {suit}
        </Text>
      </View>
    </BlurView>
  )

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={animatedStyle}>
        {content}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
  },
  faceDownCard: {
    backgroundColor: "rgba(37,99,235,0.6)",
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  faceUpCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  selectedCard: {
    borderColor: "#60a5fa",
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  faceDownPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  patternBorder1: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  patternBorder2: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
  },
  faceDownIcon: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "bold",
    fontSize: 16,
  },
  faceDownIconSmall: {
    fontSize: 12,
  },
  topLeft: {
    position: "absolute",
    top: 4,
    left: 4,
    alignItems: "center",
  },
  topLeftSmall: {
    top: 2,
    left: 2,
  },
  valueText: {
    fontWeight: "bold",
    fontSize: 10,
  },
  valueTextXs: {
    fontSize: 7,
  },
  valueTextSm: {
    fontSize: 8,
  },
  suitText: {
    fontSize: 12,
  },
  suitTextXs: {
    fontSize: 8,
  },
  suitTextSm: {
    fontSize: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerSuit: {
    fontSize: 24,
  },
  centerSuitXs: {
    fontSize: 14,
  },
  centerSuitSm: {
    fontSize: 18,
  },
  redText: {
    color: "#dc2626",
  },
  blackText: {
    color: "#111827",
  },
})
