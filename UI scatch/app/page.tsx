"use client"
import { GameBoard } from "@/components/game-board"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900">
      <GameBoard />
    </main>
  )
}
