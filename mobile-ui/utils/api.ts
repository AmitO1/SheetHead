import { LobbyPlayer, GameState, LobbyStatus } from "./types"

// Use localhost for iOS Simulator, 10.0.2.2 for Android Emulator, or your LAN IP for physical device
// const API_URL = "http://10.0.2.2:3000" 
const API_URL = "http://51.16.14.62:4000"

export type CreateGameResponse = {
  gameId: string
  players: LobbyPlayer[]
}

export type JoinGameResponse = {
  gameId: string
  player: LobbyPlayer
}

export type StartGameResponse = {
  gameId: string
  state: GameState
}

export type GameStateResponse = {
  gameId: string
  status: LobbyStatus
  state?: GameState
  players?: LobbyPlayer[]
}

export async function createGame(playerNames: string[] = []): Promise<CreateGameResponse> {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerNames }),
  })
  if (!response.ok) throw new Error("Failed to create game")
  return response.json()
}

export async function joinGame(gameId: string, name: string): Promise<JoinGameResponse> {
  const response = await fetch(`${API_URL}/games/${gameId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to join game")
  }
  return response.json()
}

export async function startGame(gameId: string): Promise<StartGameResponse> {
  const response = await fetch(`${API_URL}/games/${gameId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
  if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to start game")
  }
  return response.json()
}

export async function getGameState(gameId: string): Promise<GameStateResponse> {
  const response = await fetch(`${API_URL}/games/${gameId}/state`)
  if (!response.ok) throw new Error("Failed to get game state")
  
  const data = await response.json()
  
  // If waiting, construct a temporary GameState
  if (data.status === "waiting" && data.players) {
      return {
          ...data,
          state: {
              players: data.players.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  hand: [],
                  faceUp: [],
                  faceDown: [],
                  isOut: false
              })),
              deck: [],
              pile: [],
              currentPlayerIndex: 0,
              lastPlayedPlayerId: "",
              status: "waiting",
              isAnotherTurn: false
          }
      }
  }

  return data
}
