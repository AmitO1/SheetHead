import { FastifyInstance } from "fastify"
import { playCards, takePile } from "./game/GameEngine"
import { ensureGame, broadcastGameState, startTurnTimer, stopTurnTimer } from "./gameStore"
import { ClientMessage, ServerMessage } from "./types"

export function registerWebSocket(fastify: FastifyInstance) {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    console.log("WebSocket connection established")

    connection.socket.on("message", async (message: Buffer) => {
      try {
        const data: ClientMessage = JSON.parse(message.toString())

        switch (data.type) {
          case "JOIN_GAME": {
            const game = ensureGame(data.gameId)

            // Verify player is in game
            const player = game.players.find((p) => p.id === data.playerId)
            if (!player) {
              connection.socket.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Player not in game",
                } as ServerMessage)
              )
              return
            }

            // Add connection to game
            game.connections.add(connection.socket)

            // Send confirmation
            connection.socket.send(
              JSON.stringify({
                type: "CONNECTED",
                gameId: data.gameId,
                playerId: data.playerId,
              } as ServerMessage)
            )

            // Send current game state
            if (game.state) {
              connection.socket.send(
                JSON.stringify({
                  type: "GAME_STATE_UPDATE",
                  state: game.state,
                  gameId: game.id,
                } as ServerMessage)
              )
            }

            // Handle disconnect
            connection.socket.on("close", () => {
              game.connections.delete(connection.socket)
              console.log(`Player ${data.playerId} disconnected from game ${data.gameId}`)
            })

            break
          }

          case "PLAY_CARDS": {
            const game = ensureGame(data.gameId)
            if (game.status !== "playing" || !game.state) {
              connection.socket.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Game not started",
                } as ServerMessage)
              )
              return
            }

            const currentPlayer = game.state.players[game.state.currentPlayerIndex]
            if (currentPlayer?.id !== data.playerId) {
              connection.socket.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Not your turn",
                } as ServerMessage)
              )
              return
            }

            const success = playCards(game.state, data.playerId, data.cardIds)
            if (!success) {
              connection.socket.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Invalid move",
                } as ServerMessage)
              )
              return
            }

            // Stop timer and start for next player (if turn advanced)
            stopTurnTimer(game)
            if (game.state.status === "playing") {
              startTurnTimer(game)
            }

            // Broadcast updated state
            broadcastGameState(game)
            break
          }

          case "TAKE_PILE": {
            const game = ensureGame(data.gameId)
            if (game.status !== "playing" || !game.state) {
              connection.socket.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Game not started",
                } as ServerMessage)
              )
              return
            }

            const currentPlayer = game.state.players[game.state.currentPlayerIndex]
            if (currentPlayer?.id !== data.playerId) {
              connection.socket.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Not your turn",
                } as ServerMessage)
              )
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
            break
          }

          case "PING": {
            connection.socket.send(JSON.stringify({ type: "PONG" } as ServerMessage))
            break
          }
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error)
        connection.socket.send(
          JSON.stringify({
            type: "ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          } as ServerMessage)
        )
      }
    })

    connection.socket.on("error", (error: Error) => {
      console.error("WebSocket error:", error)
    })
  })
}

