import { View, Text, StyleSheet } from "react-native"
import { BlurView } from "expo-blur"
import { PlayingCard } from "./PlayingCard"

interface DeckProps {
  cardsRemaining: number
}

export function Deck({ cardsRemaining }: DeckProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={30} style={styles.label}>
        <Text style={styles.labelText}>Deck</Text>
      </BlurView>

      <View style={styles.deckContainer}>
        <View style={[styles.stackCard, styles.stackCard1]}>
          <PlayingCard faceDown size="md" />
        </View>
        <View style={[styles.stackCard, styles.stackCard2]}>
          <PlayingCard faceDown size="md" />
        </View>
        <PlayingCard faceDown size="md" />
      </View>

      <BlurView intensity={30} style={styles.counter}>
        <Text style={styles.counterText}>{cardsRemaining} cards</Text>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  labelText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  deckContainer: {
    position: "relative",
  },
  stackCard: {
    position: "absolute",
  },
  stackCard1: {
    top: 6,
    left: 6,
    opacity: 0.6,
  },
  stackCard2: {
    top: 3,
    left: 3,
    opacity: 0.8,
  },
  counter: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  counterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
})
