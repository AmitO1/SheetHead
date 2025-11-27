const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"

type GameStatus = "waiting" | "playing" | "finished"

export interface ClientGameState {
  gameId: string
  status: GameStatus
  state?: any
  players?: { id: string; name: string }[]
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.error || `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  createGame: (playerNames?: string[]) =>
    api<{ gameId: string; players: { id: string; name: string }[] }>("/games", {
      method: "POST",
      body: JSON.stringify({ playerNames }),
    }),

  joinGame: (gameId: string, name: string) =>
    api<{ gameId: string; player: { id: string; name: string } }>(`/games/${gameId}/join`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  startGame: (gameId: string) => api<{ gameId: string; state: any }>(`/games/${gameId}/start`, { method: "POST" }),

  playCards: (gameId: string, playerId: string, cardIds: string[]) =>
    api<{ state: any }>(`/games/${gameId}/play`, {
      method: "POST",
      body: JSON.stringify({ playerId, cardIds }),
    }),

  takePile: (gameId: string, playerId: string) =>
    api<{ state: any }>(`/games/${gameId}/take-pile`, {
      method: "POST",
      body: JSON.stringify({ playerId }),
    }),

  getState: (gameId: string) => api<ClientGameState>(`/games/${gameId}/state`),
}
