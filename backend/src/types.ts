import { GameState } from "../../game/GameEngine"

export type LobbyStatus = "waiting" | "playing" | "finished"

export type LobbyPlayer = {
  id: string
  name: string
}

export type LobbyGame = {
  id: string
  status: LobbyStatus
  players: LobbyPlayer[]
  state?: GameState
  connections: Set<any> // WebSocket connections
  turnTimer?: NodeJS.Timeout
  turnStartTime?: number
}

// Message types for WebSocket communication
export type ClientMessage =
  | { type: "JOIN_GAME"; gameId: string; playerId: string }
  | { type: "PLAY_CARDS"; gameId: string; playerId: string; cardIds: string[] }
  | { type: "TAKE_PILE"; gameId: string; playerId: string }
  | { type: "PING" }

export type ServerMessage =
  | { type: "GAME_STATE_UPDATE"; state: GameState; gameId: string }
  | { type: "TURN_TIMER_UPDATE"; timeRemaining: number; playerId: string }
  | { type: "TURN_TIMER_EXPIRED"; playerId: string }
  | { type: "PLAYER_JOINED"; player: LobbyPlayer }
  | { type: "ERROR"; message: string }
  | { type: "PONG" }
  | { type: "CONNECTED"; gameId: string; playerId: string }

