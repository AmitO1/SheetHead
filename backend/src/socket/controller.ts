import { WebSocket } from "ws"
import { playCards, takePile, checkPlayable } from "../game/GameEngine"
import { ensureGame, broadcastGameState, startTurnTimer, stopTurnTimer } from "../gameStore"
import { ClientMessage, ServerMessage } from "../types"

export async function handleSocketMessage(socket: WebSocket, message: Buffer) {
  try {
    const data: ClientMessage = JSON.parse(message.toString())

    switch (data.type) {
      case "JOIN_GAME":
        handleJoinGame(socket, data)
        break
      case "PLAY_CARDS":
        handlePlayCards(socket, data)
        break
      case "TAKE_PILE":
        handleTakePile(socket, data)
        break
      case "CHECK_PLAYABLE":
        handleCheckPlayable(socket, data)
        break
      case "PING":
        socket.send(JSON.stringify({ type: "PONG" } as ServerMessage))
        break
    }
  }
    catch (error) {
    console.error("Error handling WebSocket message:", error)
    sendError(socket, error instanceof Error ? error.message : "Unknown error")
  }
}

function handleJoinGame(socket: WebSocket, data: { gameId: string; playerId: string }) {
  const game = ensureGame(data.gameId)

  // Verify player is in game
  const player = game.players.find((p) => p.id === data.playerId)
  if (!player) {
    sendError(socket, "Player not in game")
    return
  }

  // Add connection to game
  game.connections.add(socket)

  // Send confirmation
  const connectedMsg: ServerMessage = {
    type: "CONNECTED",
    gameId: data.gameId,
    playerId: data.playerId,
  }
  socket.send(JSON.stringify(connectedMsg))

  // Send current game state
  if (game.state) {
    const stateMsg: ServerMessage = {
      type: "GAME_STATE_UPDATE",
      state: game.state,
      gameId: game.id,
    }
    socket.send(JSON.stringify(stateMsg))
  }

  // Handle disconnect
  socket.on("close", () => {
    game.connections.delete(socket)
    console.log(`Player ${data.playerId} disconnected from game ${data.gameId}`)
  })
}

function handlePlayCards(socket: WebSocket, data: { gameId: string; playerId: string; cardIds: string[] }) {
  const game = ensureGame(data.gameId)
  if (game.status !== "playing" || !game.state) {
    sendError(socket, "Game not started")
    return
  }

  const currentPlayer = game.state.players[game.state.currentPlayerIndex]
  if (currentPlayer?.id !== data.playerId) {
    sendError(socket, "Not your turn")
    return
  }

  const success = playCards(game.state, data.playerId, data.cardIds)
  if (!success) {
    sendError(socket, "Invalid move")
    return
  }

  // Stop timer and start for next player (if turn advanced)
  stopTurnTimer(game)
  if (game.state.status === "playing") {
    startTurnTimer(game)
  }

  // Broadcast updated state
  broadcastGameState(game)
}

function handleTakePile(socket: WebSocket, data: { gameId: string; playerId: string }) {
  const game = ensureGame(data.gameId)
  if (game.status !== "playing" || !game.state) {
    sendError(socket, "Game not started")
    return
  }

  const currentPlayer = game.state.players[game.state.currentPlayerIndex]
  if (currentPlayer?.id !== data.playerId) {
    sendError(socket, "Not your turn")
    return
  }

  takePile(game.state, data.playerId)

  // Stop timer and start for next player
  stopTurnTimer(game)
  if (game.state.status === "playing") {
    startTurnTimer(game)
  }

  // Broadcast updated state
  broadcastGameState(game)
}

function handleCheckPlayable(socket: WebSocket, data: { gameId: string; playerId: string }) {
  const game = ensureGame(data.gameId)
  if (!game.state) return

  const player = game.state.players.find(p => p.id === data.playerId)
  if (!player) return

  const topCard = game.state.pile.at(-1)
  
  const isPlayable = checkPlayable(player.hand, topCard, game.state, data.playerId)
  
  socket.send(JSON.stringify({
    type: "CHECK_PLAYABLE_RESULT",
    isPlayable,
    gameId: data.gameId
  } as ServerMessage))
}

function sendError(socket: WebSocket, message: string) {
  socket.send(
    JSON.stringify({
      type: "ERROR",
      message,
    } as ServerMessage)
  )
}
