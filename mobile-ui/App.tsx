import { useState, useEffect } from "react"
import { View, StatusBar, StyleSheet, Alert } from "react-native"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { LinearGradient } from "expo-linear-gradient"

import { GameBoard } from "./components/GameBoard"
import { JoinGame } from "./components/JoinGame"
import { createGame, joinGame, getGameState, startGame } from "./utils/api"
import { gameSocket } from "./utils/socket"
import { GameState } from "./utils/types"

function AppContent() {
  const insets = useSafeAreaInsets()
  const [isInGame, setIsInGame] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [gameId, setGameId] = useState<string>("")
  const [playerId, setPlayerId] = useState<string>("")
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    if (gameId && playerId) {
      console.log("Connecting socket...", gameId, playerId)
      gameSocket.connect(gameId, playerId)

      const cleanupState = gameSocket.onGameState((state) => {
        setGameState(state)
        setIsInGame(true)
      })

      const cleanupConnected = gameSocket.onConnected(() => {
          console.log("Socket Connected!")
      })

      const cleanupPlayerJoined = gameSocket.onPlayerJoined((newPlayer) => {
          console.log("App: Player Joined event received:", newPlayer)
          setGameState((prev) => {
              if (!prev) return prev
              // Avoid duplicates
              if (prev.players.some(p => p.id === newPlayer.id)) return prev
              
              return {
                  ...prev,
                  players: [
                      ...prev.players,
                      {
                          id: newPlayer.id,
                          name: newPlayer.name,
                          hand: [],
                          faceUp: [],
                          faceDown: [],
                          isOut: false
                      }
                  ]
              }
          })
      })

      return () => {
        cleanupState()
        cleanupConnected()
        cleanupPlayerJoined()
        gameSocket.disconnect()
      }
    }
  }, [gameId, playerId])

  const handleStartGame = async (name: string, inputGameId: string, count?: number) => {
    try {
      let currentGameId = inputGameId
      let currentPlayerId = ""

      console.log("Handle Start Game:", name, inputGameId, count)
      if (count) {
        // Create Game
        console.log("Creating game...")
        const res = await createGame([name]) 
        console.log("Game created:", res)
        currentGameId = res.gameId
        currentPlayerId = res.players[0].id
      } else {
        // Join Game
        console.log("Joining game...", inputGameId)
        const res = await joinGame(inputGameId, name)
        console.log("Game joined:", res)
        currentGameId = res.gameId
        currentPlayerId = res.player.id
      }

      setPlayerName(name)
      setGameId(currentGameId)
      setPlayerId(currentPlayerId)

      // Start fetching initial state or wait for socket
      console.log("Fetching initial state for:", currentGameId)
      try {
          const stateRes = await getGameState(currentGameId)
          console.log("Initial state received:", stateRes)
          if(stateRes.state) {
            setGameState(stateRes.state)
            setIsInGame(true)
          } else {
             console.log("No state in response?")
          }
      } catch(e) {
          console.log("Could not get initial state, waiting for socket", e)
      }
      
    } catch (error) {
      console.error("Error starting/joining game:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to enter game")
    }
  }

  const handleLobbyStart = async () => {
      try {
          console.log("Starting game (lobby)...", gameId)
          await startGame(gameId)
          console.log("Start game requested successfully")
      } catch (error) {
          console.error("Failed to start game:", error)
          Alert.alert("Error", "Failed to start game: " + (error instanceof Error ? error.message : String(error)))
      }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#532c5d", "#d4c7de", "#f7f7fb"]} style={styles.gradient}>
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {isInGame && gameState ? (
            <GameBoard 
              gameState={gameState} 
              playerId={playerId}
              gameId={gameId}
              onPlayCards={(cardIds) => gameSocket.send({ type: "PLAY_CARDS", gameId, playerId, cardIds })}
              onTakePile={() => gameSocket.send({ type: "TAKE_PILE", gameId, playerId })}
              checkPlayable={() => gameSocket.checkPlayable(gameId, playerId)}
              onStartGame={handleLobbyStart}
            />
          ) : (
            <JoinGame onStartGame={handleStartGame} />
          )}
        </View>
      </LinearGradient>
    </View>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
