"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native"
import { PlayerArea } from "./PlayerArea"
import { DraggableCard } from "./DraggableCard"
import { CenterPile } from "./CenterPile"
import { Deck } from "./Deck"
import { TakePileButton } from "./TakePileButton"
import { detectDropZone, getDefaultDropZones } from "../utils/dropZoneDetection"
import { GameState, Card } from "../utils/types"
import { BlurView } from "expo-blur"

const { width, height } = Dimensions.get("window")
const isTablet = width >= 768

interface GameBoardProps {
  gameState: GameState
  playerId: string
  gameId: string
  onPlayCards: (cardIds: string[]) => void
  onTakePile: () => void
  onStartGame: () => void 
}

const getSuitColor = (suit: string) => {
  return suit === '♥' || suit === '♦' ? 'red' : 'black';
}

export function GameBoard({ gameState, playerId, gameId, onPlayCards, onTakePile, onStartGame }: GameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [showPileHistory, setShowPileHistory] = useState(false)
  const [draggingCard, setDraggingCard] = useState<string | null>(null)
  const [heldGroup, setHeldGroup] = useState<{ primaryId: string | null; extras: Card[] }>({
    primaryId: null,
    extras: [],
  })

  const currentPlayer = gameState.players.find(p => p.id === playerId)
  const opponents = gameState.players.filter(p => p.id !== playerId)
  
  // If player list is not full or we want to show empty seats, we might need logic.
  // For now, just show opponents at top.
  
  const handCards = currentPlayer?.hand || []

  // Reset held group if hand changes (turn end)
  useEffect(() => {
    setHeldGroup({ primaryId: null, extras: [] })
    setSelectedCard(null)
  }, [gameState.currentPlayerIndex]) // Reset when turn changes

  const { centerPileZone, playerHandZone } = getDefaultDropZones()

  const handleDragStart = (cardId: string) => {
    setDraggingCard(cardId)
  }

  const handleCardLongHold = (cardId: string) => {
      const heldCard = handCards.find((card) => card.id === cardId)
      if (!heldCard) return

      const extras = handCards.filter((card) => card.value === heldCard.value && card.id !== cardId)
      if (extras.length === 0) {
        setHeldGroup({ primaryId: null, extras: [] })
        return
      }

      setHeldGroup({ primaryId: cardId, extras })
  }

  const handleDragEnd = (cardId: string, dropX: number, dropY: number) => {
    setDraggingCard(null)

    const detection = detectDropZone(dropX, dropY, centerPileZone, playerHandZone)
    const playedToCenter =
      detection.isInCenterPile || (!detection.isInPlayerHand && detection.closestZone === "centerPile")

    if (playedToCenter) {
      if (heldGroup.primaryId === cardId) {
        // Play group
        const cardIds = [cardId, ...heldGroup.extras.map(c => c.id)]
        onPlayCards(cardIds)
        setHeldGroup({ primaryId: null, extras: [] })
      } else {
        // Play single
        onPlayCards([cardId])
      }
    } else {
        // Returned to hand, just clear held group if needed, or keep it?
        // Logic in original code was complex local state manipulation.
        // Here we just don't send the action.
        if (heldGroup.primaryId === cardId) {
             setHeldGroup({ primaryId: null, extras: [] })
        }
    }
  }
  
  if (!currentPlayer) return <View><StartGameError /></View> // Should not happen

  return (
    <View style={styles.container}>
      {/* Game ID Display */}
      <View style={{position: 'absolute', top: 40, left: 20, zIndex: 100}}>
        <BlurView intensity={30} style={{padding: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)'}}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Game ID:</Text>
            <Text style={{color: 'white', fontSize: 16, userSelect: 'text' as any}} selectable>{gameId}</Text>
        </BlurView>
      </View>

      {/* Waiting Lobby Overlay */}
      {gameState.status === 'waiting' && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <BlurView intensity={50} style={{ padding: 24, borderRadius: 24, alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Waiting for Players...</Text>
                  <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>
                      {gameState.players.length} Player{gameState.players.length !== 1 ? 's' : ''} Joined
                  </Text>
                  
                  {/* List players */}
                  <View style={{ gap: 8, width: 200, marginVertical: 8 }}>
                      {gameState.players.map(p => (
                          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.id === playerId ? '#4ade80' : '#cbd5e1' }} />
                              <Text style={{ color: 'white', fontWeight: '500' }}>{p.name} {p.id === playerId ? '(You)' : ''}</Text>
                          </View>
                      ))}
                  </View>

                  <TouchableOpacity 
                      onPress={onStartGame}
                      activeOpacity={0.8}
                      style={{ 
                          backgroundColor: gameState.players.length >= 2 ? '#3b82f6' : '#94a3b8', 
                          paddingVertical: 12, 
                          paddingHorizontal: 32, 
                          borderRadius: 12,
                          opacity: 1 // Always visible, just grayed out if disabled
                      }}
                      disabled={gameState.players.length < 2}
                  >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                        {gameState.players.length >= 2 ? "Start Game" : "Waiting for Opponent..."}
                      </Text>
                  </TouchableOpacity>
                  {gameState.players.length < 2 && (
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      Need at least 2 players to start
                    </Text>
                  )}
              </BlurView>
          </View>
      )}

      {/* Top Players */}
      <View style={[styles.topPlayers, isTablet && styles.topPlayersTablet]}>
        {opponents.map((player, index) => (
          <PlayerArea 
            key={player.id} 
            player={{
                id: player.id,
                name: player.name,
                avatar: "",
                isCurrentPlayer: false
            }} 
            position="top" 
            timerProgress={0} // TODO: Implement timer logic
          />
        ))}
      </View>

      {/* Center Area - Pile and Deck */}
      <View style={[styles.centerArea, isTablet && styles.centerAreaTablet]}>
        <CenterPile 
            showHistory={showPileHistory} 
            onToggleHistory={() => setShowPileHistory(!showPileHistory)} 
            cards={gameState.pile}
        /> 
        {/* We need to pass real pile cards to CenterPile, but current component might mock it. */}
        {/* Assuming CenterPile needs update too, but let's stick to GameBoard first. 
            Actually, CenterPile needs real data or it will be empty. 
            For now, let's just render the container. 
        */}
        <Deck cardsRemaining={gameState.deck.length} />
      </View>

      {/* Bottom Player Area */}
      <View style={[styles.bottomArea, isTablet && styles.bottomAreaTablet]}>
        <PlayerArea 
            player={{
                id: currentPlayer.id,
                name: currentPlayer.name,
                avatar: "",
                isCurrentPlayer: true
            }} 
            position="bottom" 
            timerProgress={0} // TODO 
        />

        {/* Take Pile Button */}
        {gameState.pile.length > 0 && (
            <View style={styles.takePileContainer}>
            <TakePileButton onPress={onTakePile} />
            </View>
        )}

        {/* Hand Cards */}
        <View style={styles.handCards}>
          {handCards.map((card, index) => {
            const isHeld = heldGroup.primaryId === card.id || heldGroup.extras.some(e => e.id === card.id)
            // If it is an extra card in a held group, don't render it separately (it "stacks" visually behind, 
            // but DraggableCard logic for grouping needs to be robust. 
            // In original code: `return currentHand.filter((card) => !extras.some((extra) => extra.id === card.id))`
            // We are using `handCards` from props, so we can't filter it out permanently.
            // We should hide extras.
            
            if (heldGroup.extras.some(e => e.id === card.id)) return null;

            return (
            <View
              key={card.id}
              style={[styles.handCard, { zIndex: index, marginLeft: index > 0 ? (isTablet ? -28 : -24) : 0 }]}
            >
              <DraggableCard
                cardId={card.id} // DraggableCard expects string or number? Original was number.
                // We need to check DraggableCard types. But Card.id is string (UUID).
                // Let's assume we need to update DraggableCard or cast if it expects number.
                // Looking at GameBoard.tsx line 52: handleDragStart(cardId: number).
                // So DraggableCard probably expects number.
                // I need to check DraggableCard.tsx.
                // FOR NOW, I will cast to any to avoid error, then fix dependencies.
                // actually better to check DraggableCard.
                value={card.value}
                suit={card.suit}
                color={getSuitColor(card.suit)}
                isSelected={selectedCard === card.id}
                isDragging={draggingCard === card.id}
                size="sm"
                onPress={() => setSelectedCard(card.id)}
                onDragStart={() => handleDragStart(card.id)}
                onDragEnd={(dropX, dropY) => handleDragEnd(card.id, dropX, dropY)}
                onLongHold={() => handleCardLongHold(card.id)}
                groupedCount={heldGroup.primaryId === card.id ? heldGroup.extras.length : 0}
              />
            </View>
          )})}
        </View>
      </View>
    </View>
  )
}

function StartGameError() {
    return <View><text>Error: Player not found in game</text></View>
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
