interface PlayingCardProps {
  value?: string
  suit?: string
  color?: "red" | "black"
  faceDown?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  isSelected?: boolean
}

export function PlayingCard({
  value,
  suit,
  color = "black",
  faceDown = false,
  size = "md",
  isSelected = false,
}: PlayingCardProps) {
  const sizeClasses = {
    xs: "w-7 h-10",
    sm: "w-10 h-14",
    md: "w-14 h-20",
    lg: "w-18 h-24",
  }

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 border-2 border-amber-600 shadow-lg flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-1 border border-amber-400/30 rounded" />
          <div className="absolute inset-2 border border-amber-400/20 rounded" />
        </div>
        <div className={`text-amber-300/40 font-bold ${size === "xs" ? "text-xs" : "text-base"}`}>♠</div>
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border-2 ${
        isSelected ? "border-amber-500 shadow-xl shadow-amber-400/50" : "border-amber-200"
      } shadow-lg flex flex-col relative overflow-hidden`}
    >
      {/* Top-left corner - value and suit */}
      <div
        className={`font-bold ${color === "red" ? "text-red-600" : "text-gray-900"} flex flex-col items-center leading-none absolute top-0 left-0 ${size === "xs" ? "p-0.5" : "p-1"}`}
      >
        <div className={size === "xs" ? "text-[7px]" : size === "sm" ? "text-[8px]" : "text-[10px]"}>{value}</div>
        <div className={size === "xs" ? "text-[8px]" : size === "sm" ? "text-[10px]" : "text-xs"}>{suit}</div>
      </div>

      {/* Center suit symbol */}
      <div className="flex items-center justify-center flex-1">
        <span
          className={`${size === "xs" ? "text-sm" : size === "sm" ? "text-lg" : "text-2xl"} ${color === "red" ? "text-red-600" : "text-gray-900"}`}
        >
          {suit}
        </span>
      </div>
    </div>
  )
}
