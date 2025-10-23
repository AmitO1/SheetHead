"use client"

import { useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { PlayerArea } from "./PlayerArea"
import { PlayingCard } from "./PlayingCard"
import { CenterPile } from "./CenterPile"
import { Deck } from "./Deck"
import { TakePileButton } from "./TakePileButton"

const { width, height } = Dimensions.get("window")
const isTablet = width >= 768
const isDesktop = width >= 1024

// Mock data
const mockPlayers = [
  { id: 1, name: "Player 1", avatar: "", isCurrentPlayer: false },
  { id: 2, name: "Player 2", avatar: "", isCurrentPlayer: false },
  { id: 3, name: "Player 3", avatar: "", isCurrentPlayer: false },
]

const mockCurrentPlayer = {
  id: 4,
  name: "You",
  avatar: "",
  isCurrentPlayer: true,
}

const mockHandCards = [
  { id: 1, value: "A", suit: "♠", color: "black" as const },
  { id: 2, value: "K", suit: "♥", color: "red" as const },
  { id: 3, value: "Q", suit: "♣", color: "black" as const },
  { id: 4, value: "J", suit: "♦", color: "red" as const },
  { id: 5, value: "10", suit: "♠", color: "black" as const },
]

export function GameBoard() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showPileHistory, setShowPileHistory] = useState(false)

  return (
    <View style={styles.container}>
      {/* Top Players */}
      <View style={[styles.topPlayers, isTablet && styles.topPlayersTablet]}>
        {mockPlayers.map((player, index) => (
          <PlayerArea key={player.id} player={player} position="top" timerProgress={75 - index * 20} />
        ))}
      </View>

      {/* Center Area - Pile and Deck */}
      <View style={[styles.centerArea, isTablet && styles.centerAreaTablet]}>
        <CenterPile showHistory={showPileHistory} onToggleHistory={() => setShowPileHistory(!showPileHistory)} />
        <Deck cardsRemaining={32} />
      </View>

      {/* Bottom Player Area */}
      <View style={[styles.bottomArea, isTablet && styles.bottomAreaTablet]}>
        <PlayerArea player={mockCurrentPlayer} position="bottom" timerProgress={90} />

        {/* Take Pile Button */}
        <View style={styles.takePileContainer}>
          <TakePileButton onPress={() => console.log("Take pile pressed")} />
        </View>

        {/* Hand Cards */}
        <View style={styles.handCards}>
          {mockHandCards.map((card, index) => (
            <View
              key={card.id}
              style={[styles.handCard, { zIndex: index, marginLeft: index > 0 ? (isTablet ? -28 : -24) : 0 }]}
            >
              <PlayingCard
                value={card.value}
                suit={card.suit}
                color={card.color}
                isSelected={selectedCard === card.id}
                size="sm"
                onPress={() => setSelectedCard(card.id)}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    paddingVertical: 16,
  },
  topPlayers: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 6,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topPlayersTablet: {
    gap: 12,
    paddingTop: 40,
    paddingBottom: 40,
  },
  centerArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 24,
  },
  centerAreaTablet: {
    gap: 32,
    marginVertical: 64,
  },
  bottomArea: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
    marginTop: 16,
    position: "relative",
  },
  bottomAreaTablet: {
    gap: 12,
    paddingBottom: 32,
    marginTop: 48,
  },
  takePileContainer: {
    position: "absolute",
    right: 8,
    top: 12,
  },
  handCards: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  handCard: {
    // Cards will overlap using negative marginLeft
  },
})
