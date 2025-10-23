import { PlayingCard } from "./playing-card"

interface DeckProps {
  cardsRemaining: number
}

export function Deck({ cardsRemaining }: DeckProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-white/80 font-semibold text-xs">Deck</span>
      <div className="relative">
        {/* Stack effect */}
        <div className="absolute top-1.5 left-1.5 opacity-60">
          <PlayingCard faceDown size="md" />
        </div>
        <div className="absolute top-0.5 left-0.5 opacity-80">
          <PlayingCard faceDown size="md" />
        </div>
        <PlayingCard faceDown size="md" />
      </div>
      <span className="text-white/60 text-xs font-medium bg-black/30 px-2 py-0.5 rounded-full">
        {cardsRemaining} cards
      </span>
    </div>
  )
}
