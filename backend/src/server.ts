import Fastify, { FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import { v4 as uuidv4 } from "uuid"
import {
  startGame,
  playCards,
  takePile,
  GameState,
} from "../../game/GameEngine"

type LobbyStatus = "waiting" | "playing" | "finished"

type LobbyPlayer = {
  id: string
  name: string
}

type LobbyGame = {
  id: string
  status: LobbyStatus
  players: LobbyPlayer[]
  state?: GameState
}

const games = new Map<string, LobbyGame>()

function ensureGame(gameId: string): LobbyGame {
  const game = games.get(gameId)
  if (!game) {
    throw new Error("Game not found")
  }
  return game
}

function mapLobbyPlayersToState(lobbyPlayers: LobbyPlayer[], state: GameState) {
  state.players.forEach((player, idx) => {
    const lobbyPlayer = lobbyPlayers[idx]
    if (lobbyPlayer) {
      player.id = lobbyPlayer.id
      player.name = lobbyPlayer.name
    }
  })
}

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })

  app.post<{
    Body: { playerNames?: string[] }
  }>("/games", async (request, reply) => {
    const gameId = uuidv4()
    const players: LobbyPlayer[] = (request.body?.playerNames || []).map((name) => ({
      id: uuidv4(),
      name,
    }))

    games.set(gameId, {
      id: gameId,
      status: "waiting",
      players,
    })

    return reply.code(201).send({ gameId, players })
  })

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
    return reply.code(200).send({ gameId: game.id, player })
  })

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

    return reply.code(200).send({ gameId: game.id, state })
  })

  app.post<{
    Params: { gameId: string }
    Body: { playerId: string; cardIds: string[] }
  }>("/games/:gameId/play", async (request, reply) => {
    const game = ensureGame(request.params.gameId)
    if (game.status !== "playing" || !game.state) {
      return reply.code(400).send({ error: "Game not started" })
    }

    const { playerId, cardIds } = request.body
    const currentPlayer = game.state.players[game.state.currentPlayerIndex]
    if (currentPlayer?.id !== playerId) {
      return reply.code(400).send({ error: "Not your turn" })
    }

    const success = playCards(game.state, playerId, cardIds)
    if (!success) {
      return reply.code(400).send({ error: "Invalid move" })
    }

    games.set(game.id, game)
    return reply.code(200).send({ state: game.state })
  })

  app.post<{
    Params: { gameId: string }
    Body: { playerId: string }
  }>("/games/:gameId/take-pile", async (request, reply) => {
    const game = ensureGame(request.params.gameId)
    if (game.status !== "playing" || !game.state) {
      return reply.code(400).send({ error: "Game not started" })
    }

    const { playerId } = request.body
    const currentPlayer = game.state.players[game.state.currentPlayerIndex]
    if (currentPlayer?.id !== playerId) {
      return reply.code(400).send({ error: "Not your turn" })
    }

    takePile(game.state, playerId)
    games.set(game.id, game)
    return reply.code(200).send({ state: game.state })
  })

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

  return app
}

export async function startLocalServer() {
  const server = buildServer()
  const port = Number(process.env.PORT) || 4000
  const host = process.env.HOST || "127.0.0.1"
  await server.listen({ port, host })
}
