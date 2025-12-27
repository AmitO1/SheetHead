import { ServerMessage, ClientMessage, GameState, LobbyPlayer } from "./types"

// Use localhost for iOS Simulator, 10.0.2.2 for Android Emulator
// const WS_URL = "ws://10.0.2.2:4000/ws"
const WS_URL = "ws://localhost:4000/ws"

type GameStateCallback = (state: GameState) => void
type ConnectedCallback = () => void

class GameSocket {
  private socket: WebSocket | null = null
  private onGameStateCallbacks: Set<GameStateCallback> = new Set()
  private onConnectedCallbacks: Set<ConnectedCallback> = new Set()
  private onPlayerJoinedCallbacks: Set<(player: LobbyPlayer) => void> = new Set()

  connect(gameId: string, playerId: string) {
    if (this.socket) {
      this.socket.close()
    }

    this.socket = new WebSocket(WS_URL)

    this.socket.onopen = () => {
      console.log(`[Socket] Connected to ${WS_URL}`)
      this.send({
        type: "JOIN_GAME",
        gameId,
        playerId,
      })
    }

    this.socket.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (e) {
        console.error("[Socket] Failed to parse message", e)
      }
    }

    this.socket.onerror = (e) => {
      console.error("[Socket] Error:", e)
    }

    this.socket.onclose = (e) => {
      console.log(`[Socket] Disconnected. Code: ${e.code}, Reason: ${e.reason}`)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  send(message: ClientMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket not connected, cannot send message", message)
    }
  }

  onGameState(callback: GameStateCallback) {
    this.onGameStateCallbacks.add(callback)
    return () => {
      this.onGameStateCallbacks.delete(callback)
    }
  }

  onConnected(callback: ConnectedCallback) {
      this.onConnectedCallbacks.add(callback)
      return () => {
          this.onConnectedCallbacks.delete(callback)
      }
  }

  onPlayerJoined(callback: (player: LobbyPlayer) => void) {
      this.onPlayerJoinedCallbacks.add(callback)
      return () => {
          this.onPlayerJoinedCallbacks.delete(callback)
      }
  }

  private handleMessage(message: ServerMessage) {
    console.log("Received message:", message.type)
    switch (message.type) {
      case "GAME_STATE_UPDATE":
        this.onGameStateCallbacks.forEach(cb => cb(message.state))
        break
      case "PLAYER_JOINED":
          this.onPlayerJoinedCallbacks.forEach(cb => cb(message.player))
          break
      case "CONNECTED":
          this.onConnectedCallbacks.forEach(cb => cb())
          break
      case "ERROR":
        console.error("Server error:", message.message)
        break
    }
  }
}

export const gameSocket = new GameSocket()
