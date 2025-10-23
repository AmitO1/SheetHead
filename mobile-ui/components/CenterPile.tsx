import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { BlurView } from "expo-blur"
import { PlayingCard } from "./PlayingCard"

interface CenterPileProps {
  showHistory: boolean
  onToggleHistory: () => void
}

export function CenterPile({ showHistory, onToggleHistory }: CenterPileProps) {
  const pileCards = [
    { value: "5", suit: "♦", color: "red" as const },
    { value: "8", suit: "♣", color: "black" as const },
    { value: "Q", suit: "♥", color: "red" as const },
  ]

  return (
    <View style={styles.container}>
      <BlurView intensity={30} style={styles.label}>
        <Text style={styles.labelText}>Pile</Text>
      </BlurView>

      <View style={styles.pileContainer}>
        {showHistory ? (
          <View style={styles.historyRow}>
            {pileCards.map((card, index) => (
              <View key={index} style={[styles.historyCard, { opacity: 0.5 + index * 0.25 }]}>
                <PlayingCard value={card.value} suit={card.suit} color={card.color} size="md" />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.stackedPile}>
            <View style={[styles.stackCard, styles.stackCard1]} />
            <View style={[styles.stackCard, styles.stackCard2]} />
            <PlayingCard value="Q" suit="♥" color="red" size="md" />
          </View>
        )}
      </View>

      <TouchableOpacity onPress={onToggleHistory} activeOpacity={0.8}>
        <BlurView intensity={30} style={styles.button}>
          <Text style={styles.buttonText}>{showHistory ? "👁️‍🗨️ Hide" : "👁️ View Last"}</Text>
        </BlurView>
      </TouchableOpacity>
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
  pileContainer: {
    minHeight: 80,
    justifyContent: "center",
  },
  historyRow: {
    flexDirection: "row",
    gap: 8,
  },
  historyCard: {
    // Opacity set inline
  },
  stackedPile: {
    position: "relative",
  },
  stackCard: {
    position: "absolute",
    width: 56,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  stackCard1: {
    top: 4,
    left: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  stackCard2: {
    top: 2,
    left: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
})
