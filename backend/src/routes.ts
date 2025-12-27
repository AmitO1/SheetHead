import { FastifyInstance } from "fastify"
import { v4 as uuidv4 } from "uuid"
import { startGame } from "./game/GameEngine"
import { games, ensureGame, mapLobbyPlayersToState, startTurnTimer, broadcastGameState } from "./gameStore"
import { LobbyPlayer, ServerMessage } from "./types"
import { generateShortId } from "./utils"

export function registerRoutes(app: FastifyInstance) {
  // Create a new game
  app.post<{
    Body: { playerNames?: string[]; gameId?: string; playerCount?: number }
  }>("/games", async (request, reply) => {
    // Generate a short 6-character ID (Option 2)
    // We strive for uniqueness, so we'll try a few times if collision happens
    let gameId = request.body?.gameId
    
    if (!gameId) {
      let retries = 5
      do {
        gameId = generateShortId()
        retries--
      } while (games.has(gameId) && retries > 0)
      
      if (games.has(gameId)) {
        return reply.code(500).send({ error: "Failed to generate unique Game ID" })
      }
    }

    const players: LobbyPlayer[] = (request.body?.playerNames || []).map((name) => ({
      id: uuidv4(),
      name,
    }))

    // Check if provided game ID already exists
    if (games.has(gameId)) {
      return reply.code(400).send({ error: "Game ID already exists" })
    }

    games.set(gameId, {
      id: gameId,
      status: "waiting",
      players,
      connections: new Set(),
    })

    return reply.code(201).send({ gameId, players })
  })

  // Join an existing game
  app.post<{
    Params: { gameId: string }
    Body: { name: string }
  }>("/games/:gameId/join", async (request, reply) => {
    const game = ensureGame(request.params.gameId)
    if (game.status !== "waiting") {
      return reply.code(400).send({ error: "Game already started" })
    }
    if (game.players.length >= 4) {
      return reply.code(400).send({ error: "Game is full (max 4 players)" })
    }

    const player: LobbyPlayer = { id: uuidv4(), name: request.body.name }
    game.players.push(player)

    // Notify connected clients
    const message: ServerMessage = {
      type: "PLAYER_JOINED",
      player,
    }
    const messageStr = JSON.stringify(message)
    console.log(`Broadcasting PLAYER_JOINED to ${game.connections.size} clients for game ${game.id}`)
    game.connections.forEach((socket) => {
      try {
        socket.send(messageStr)
      } catch (error) {
        console.error("Error notifying player joined:", error)
      }
    })

    return reply.code(200).send({ gameId: game.id, player })
  })

  // Start a game
  app.post<{
    Params: { gameId: string }
  }>("/games/:gameId/start", async (request, reply) => {
    const game = ensureGame(request.params.gameId)
    if (game.status !== "waiting") {
      return reply.code(400).send({ error: "Game already started" })
    }
    if (game.players.length === 0) {
      return reply.code(400).send({ error: "Need at least 1 player to start" })
    }

    const state = startGame(game.players.map((p) => p.name))
    mapLobbyPlayersToState(game.players, state)
    game.state = state
    game.status = "playing"

    // Start turn timer for first player
    startTurnTimer(game)

    // Broadcast game state
    broadcastGameState(game)

    return reply.code(200).send({ gameId: game.id, state })
  })

  // Get game state
  app.get<{
    Params: { gameId: string }
  }>("/games/:gameId/state", async (request, reply) => {
    const game = ensureGame(request.params.gameId)
    if (game.status === "waiting") {
      return reply.code(200).send({ gameId: game.id, status: game.status, players: game.players })
    }
    if (!game.state) {
      return reply.code(500).send({ error: "State missing" })
    }
    return reply.code(200).send({ gameId: game.id, status: game.status, state: game.state })
  })
}

