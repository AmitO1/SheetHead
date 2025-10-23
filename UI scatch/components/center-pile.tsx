"use client"

import { PlayingCard } from "./playing-card"
import { Button } from "./ui/button"
import { Eye, EyeOff } from "lucide-react"

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
    <div className="flex flex-col items-center gap-2">
      <span className="text-white/80 font-semibold text-xs">Pile</span>
      <div className="relative">
        {showHistory ? (
          <div className="flex gap-1.5">
            {pileCards.map((card, index) => (
              <div
                key={index}
                className="transition-all"
                style={{
                  opacity: 0.5 + index * 0.25,
                }}
              >
                <PlayingCard value={card.value} suit={card.suit} color={card.color} size="md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Stack effect - showing multiple cards underneath */}
            <div className="absolute top-1 left-1 w-14 h-20 bg-amber-100/20 rounded-lg" />
            <div className="absolute top-0.5 left-0.5 w-14 h-20 bg-amber-100/30 rounded-lg" />
            <PlayingCard value="Q" suit="♥" color="red" size="md" />
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleHistory}
        className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-7"
      >
        {showHistory ? (
          <>
            <EyeOff className="w-3 h-3 mr-1" />
            Hide
          </>
        ) : (
          <>
            <Eye className="w-3 h-3 mr-1" />
            View Last
          </>
        )}
      </Button>
    </div>
  )
}
