import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { BlurView } from "expo-blur"

const { width } = Dimensions.get("window")
const isTablet = width >= 768

interface PlayingCardProps {
  value?: string
  suit?: string
  color?: "red" | "black"
  faceDown?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  isSelected?: boolean
  onPress?: () => void
}

export function PlayingCard({
  value,
  suit,
  color = "black",
  faceDown = false,
  size = "md",
  isSelected = false,
  onPress,
}: PlayingCardProps) {
  const sizes = {
    xs: { width: isTablet ? 44 : 28, height: isTablet ? 60 : 40 },
    sm: { width: isTablet ? 64 : 40, height: isTablet ? 88 : 56 },
    md: { width: isTablet ? 80 : 56, height: isTablet ? 112 : 80 },
    lg: { width: isTablet ? 104 : 72, height: isTablet ? 144 : 96 },
  }

  const cardSize = sizes[size]

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

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
  },
  faceDownCard: {
    backgroundColor: "rgba(1, 2, 7, 0.6)",
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
