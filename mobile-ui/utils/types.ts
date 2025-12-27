export type Suit = '♠' | '♥' | '♦' | '♣' | '🃏';
export type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'JOKER';

export interface Card {
  suit: Suit;
  value: Value;
  id: string; // Unique ID
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceUp: Card[];
  faceDown: Card[];
  isOut: boolean;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  pile: Card[];
  currentPlayerIndex: number;
  lastPlayedPlayerId: string;
  status: 'waiting' | 'playing' | 'finished';
  winnerId?: string;
  isAnotherTurn: boolean;
  lastPlayedCardValue?: string;
}

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
  // connections excluded as they are not needed in frontend
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
