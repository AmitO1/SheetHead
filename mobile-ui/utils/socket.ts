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

  checkPlayable(gameId: string, playerId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const handler = (isPlayable: boolean) => {
        resolve(isPlayable)
        this.removeCheckPlayableListener(listener)
      }
      
      const listener = { handler }
      this.checkPlayableListeners.add(listener)
      
      this.send({
        type: "CHECK_PLAYABLE",
        gameId,
        playerId
      })
      
      // Timeout fallback (resolve true to avoid blocking if server fails)
      setTimeout(() => {
          if (this.checkPlayableListeners.has(listener)) {
              this.removeCheckPlayableListener(listener)
              console.warn("Check playable timed out")
              resolve(true) 
          }
      }, 5000)
    })
  }

  private checkPlayableListeners: Set<{ handler: (isPlayable: boolean) => void }> = new Set()

  private removeCheckPlayableListener(listener: { handler: (isPlayable: boolean) => void }) {
      this.checkPlayableListeners.delete(listener)
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
      case "CHECK_PLAYABLE_RESULT":
          this.checkPlayableListeners.forEach(l => l.handler(message.isPlayable))
          break
      case "ERROR":
        console.error("Server error:", message.message)
        break
    }
  }
}

export const gameSocket = new GameSocket()
