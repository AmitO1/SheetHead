"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { PlayingCard } from "./playing-card"

interface Player {
  id: number
  name: string
  avatar: string
  isCurrentPlayer: boolean
}

interface PlayerAreaProps {
  player: Player
  position: "top" | "bottom"
  timerProgress: number
}

export function PlayerArea({ player, position, timerProgress }: PlayerAreaProps) {
  const isBottom = position === "bottom"
  const isTop = position === "top"

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Player Avatar with Timer Ring */}
      <div className="relative">
        <svg className={`absolute inset-0 ${isTop ? "w-8 h-8" : "w-11 h-11"} -rotate-90`} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#d97706"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerProgress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <Avatar className={`${isTop ? "w-8 h-8" : "w-11 h-11"} border-2 border-background`}>
          <AvatarImage src={player.avatar || "/placeholder.svg"} alt={player.name} />
          <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-700 text-white font-bold text-[10px]">
            {player.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Player Name */}
      <span
        className={`text-white font-semibold ${isTop ? "text-[9px]" : "text-[10px]"} px-1.5 py-0.5 bg-black/30 rounded-full backdrop-blur-sm`}
      >
        {player.name}
      </span>

      {/* Cards Area */}
      <div className="flex flex-col items-center gap-0.5">
        {/* Face-down cards (bottom layer) */}
        <div className={`flex ${isTop ? "gap-0.5" : "gap-1"}`}>
          <PlayingCard faceDown size={isTop ? "xs" : "sm"} />
          <PlayingCard faceDown size={isTop ? "xs" : "sm"} />
          <PlayingCard faceDown size={isTop ? "xs" : "sm"} />
        </div>

        {/* Face-up cards (top layer) */}
        <div className={`flex ${isTop ? "gap-0.5 -mt-6" : "gap-1 -mt-9"}`}>
          <PlayingCard value="7" suit="♠" color="black" size={isTop ? "xs" : "sm"} />
          <PlayingCard value="9" suit="♥" color="red" size={isTop ? "xs" : "sm"} />
          <PlayingCard value="K" suit="♣" color="black" size={isTop ? "xs" : "sm"} />
        </div>
      </div>
    </div>
  )
}
