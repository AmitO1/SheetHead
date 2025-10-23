"use client"

import { useState } from "react"
import { PlayerArea } from "./player-area"
import { PlayingCard } from "./playing-card"
import { CenterPile } from "./center-pile"
import { Deck } from "./deck"
import { Button } from "./ui/button"

// Mock data for demonstration
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
  { id: 1, value: "A", suit: "♠", color: "black" },
  { id: 2, value: "K", suit: "♥", color: "red" },
  { id: 3, value: "Q", suit: "♣", color: "black" },
  { id: 4, value: "J", suit: "♦", color: "red" },
  { id: 5, value: "10", suit: "♠", color: "black" },
]

export function GameBoard() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showPileHistory, setShowPileHistory] = useState(false)

  return (
    <div className="h-screen w-full flex flex-col p-2 gap-1.5 overflow-hidden">
      {/* Top Players Area */}
      <div className="flex items-start justify-center gap-1.5 pt-1">
        {mockPlayers.map((player, index) => (
          <PlayerArea key={player.id} player={player} position="top" timerProgress={75 - index * 20} />
        ))}
      </div>

      {/* Middle Area - Pile and Deck */}
      <div className="flex-1 flex items-center justify-center gap-4 min-h-0 relative">
        <CenterPile showHistory={showPileHistory} onToggleHistory={() => setShowPileHistory(!showPileHistory)} />
        <Deck cardsRemaining={32} />
      </div>

      {/* Bottom - Current Player Area */}
      <div className="flex flex-col items-center gap-2 pb-2 relative">
        <PlayerArea player={mockCurrentPlayer} position="bottom" timerProgress={90} />

        <div className="absolute right-2 top-2">
          <Button size="sm" variant="destructive" className="w-16 h-7 text-[10px] font-semibold shadow-lg">
            Take Pile
          </Button>
        </div>

        {/* Hand Cards */}
        <div className="flex items-center justify-center -space-x-6 px-2">
          {mockHandCards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className="transition-transform hover:-translate-y-3 active:scale-95"
              style={{ zIndex: index }}
            >
              <PlayingCard
                value={card.value}
                suit={card.suit}
                color={card.color}
                isSelected={selectedCard === card.id}
                size="sm"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
