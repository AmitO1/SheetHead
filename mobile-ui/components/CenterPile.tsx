import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { BlurView } from "expo-blur"
import { PlayingCard } from "./PlayingCard"
import { Card } from "../utils/types"

interface CenterPileProps {
  showHistory: boolean
  onToggleHistory: () => void
  cards: Card[]
}

const getSuitColor = (suit: string) => {
  return suit === '♥' || suit === '♦' ? 'red' : 'black';
}

export function CenterPile({ showHistory, onToggleHistory, cards }: CenterPileProps) {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null
  
  // Show last 3 cards for history if available
  const historyCards = cards.slice(-3)

  return (
    <View style={styles.container}>
      <BlurView intensity={30} style={styles.label}>
        <Text style={styles.labelText}>Pile</Text>
      </BlurView>

      <View style={styles.pileContainer}>
        {showHistory ? (
          <View style={styles.historyRow}>
            {historyCards.map((card, index) => (
              <View key={card.id} style={[styles.historyCard, { opacity: 0.5 + index * 0.25 }]}>
                <PlayingCard 
                    value={card.value} 
                    suit={card.suit} 
                    color={getSuitColor(card.suit)} 
                    size="md" 
                />
              </View>
            ))}
            {historyCards.length === 0 && <Text style={{color: 'white'}}>Empty</Text>}
          </View>
        ) : (
          <View style={styles.stackedPile}>
             {/* Render "stack" effect only if we have more than 1 card */}
            {cards.length > 1 && <View style={[styles.stackCard, styles.stackCard1]} />}
            {cards.length > 2 && <View style={[styles.stackCard, styles.stackCard2]} />}
            
            {topCard ? (
                <PlayingCard 
                    value={topCard.value} 
                    suit={topCard.suit} 
                    color={getSuitColor(topCard.suit)} 
                    size="md" 
                />
            ) : (
                <View style={[styles.emptyPile]} />
            )}
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
    width: 56, // Fixed width to prevent collapsing
    height: 80,
  },
  emptyPile: {
    width: 56,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: 'dashed',
    backgroundColor: "rgba(255,255,255,0.05)",
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
