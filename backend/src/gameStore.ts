import { GameState, takePile } from "../../game/GameEngine"
import { LobbyGame, LobbyPlayer, ServerMessage } from "./types"

export const games = new Map<string, LobbyGame>()
export const TURN_DURATION_MS = 30000 // 30 seconds per turn

export function ensureGame(gameId: string): LobbyGame {
  const game = games.get(gameId)
  if (!game) {
    throw new Error("Game not found")
  }
  return game
}

export function mapLobbyPlayersToState(lobbyPlayers: LobbyPlayer[], state: GameState) {
  state.players.forEach((player, idx) => {
    const lobbyPlayer = lobbyPlayers[idx]
    if (lobbyPlayer) {
      player.id = lobbyPlayer.id
      player.name = lobbyPlayer.name
    }
  })
}

// Broadcast game state to all connected clients
export function broadcastGameState(game: LobbyGame) {
  if (!game.state) return

  const message: ServerMessage = {
    type: "GAME_STATE_UPDATE",
    state: game.state,
    gameId: game.id,
  }

  const messageStr = JSON.stringify(message)
  game.connections.forEach((socket) => {
    try {
      socket.send(messageStr)
    } catch (error) {
      console.error("Error sending message to client:", error)
    }
  })
}

// Start turn timer for current player
export function startTurnTimer(game: LobbyGame) {
  // Clear existing timer
  if (game.turnTimer) {
    clearTimeout(game.turnTimer)
  }

  if (!game.state || game.state.status !== "playing") return

  const currentPlayer = game.state.players[game.state.currentPlayerIndex]
  if (!currentPlayer) return

  game.turnStartTime = Date.now()

  // Send timer updates every second
  const timerInterval = setInterval(() => {
    if (!game.turnStartTime || !game.state) {
      clearInterval(timerInterval)
      return
    }

    const elapsed = Date.now() - game.turnStartTime
    const remaining = Math.max(0, TURN_DURATION_MS - elapsed)

    const message: ServerMessage = {
      type: "TURN_TIMER_UPDATE",
      timeRemaining: remaining,
      playerId: currentPlayer.id,
    }

    const messageStr = JSON.stringify(message)
    game.connections.forEach((socket) => {
      try {
        socket.send(messageStr)
      } catch (error) {
        console.error("Error sending timer update:", error)
      }
    })

    if (remaining === 0) {
      clearInterval(timerInterval)
    }
  }, 1000)

  // Set timeout for turn expiration
  game.turnTimer = setTimeout(() => {
    if (!game.state || game.state.status !== "playing") return

    const currentPlayer = game.state.players[game.state.currentPlayerIndex]
    if (!currentPlayer) return

    console.log(`Turn timer expired for player ${currentPlayer.id}`)

    // Auto-take pile when timer expires
    takePile(game.state, currentPlayer.id)

    // Broadcast timer expired message
    const expiredMessage: ServerMessage = {
      type: "TURN_TIMER_EXPIRED",
      playerId: currentPlayer.id,
    }
    const expiredMessageStr = JSON.stringify(expiredMessage)
    game.connections.forEach((socket) => {
      try {
        socket.send(expiredMessageStr)
      } catch (error) {
        console.error("Error sending timer expired message:", error)
      }
    })

    // Broadcast updated game state
    broadcastGameState(game)

    // Start timer for next player
    startTurnTimer(game)
  }, TURN_DURATION_MS)
}

// Stop turn timer
export function stopTurnTimer(game: LobbyGame) {
  if (game.turnTimer) {
    clearTimeout(game.turnTimer)
    game.turnTimer = undefined
  }
  game.turnStartTime = undefined
}

