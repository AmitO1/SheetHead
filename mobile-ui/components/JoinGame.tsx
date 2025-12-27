"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { BlurView } from "expo-blur"

const { width } = Dimensions.get("window")
const isTablet = width >= 768

interface JoinGameProps {
  onStartGame: (name: string, gameId: string, playerCount?: number) => void
}

export function JoinGame({ onStartGame }: JoinGameProps) {
  const [gameMode, setGameMode] = useState<"create" | "join">("create")
  const [playerName, setPlayerName] = useState("")
  const [gameId, setGameId] = useState("")
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2)

  const handleSubmit = () => {
    if (!playerName.trim()) return
    if (gameMode === "join" && !gameId.trim()) return

    onStartGame(
      playerName.trim(),
      gameId.trim(),
      gameMode === "create" ? playerCount : undefined
    )
  }

  const isFormValid = 
    playerName.trim().length > 0 && 
    (gameMode === "create" || gameId.trim().length > 0)

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <BlurView intensity={40} style={styles.titleContainer}>
          <Text style={styles.title}>Shithead</Text>
        </BlurView>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            onPress={() => setGameMode("create")}
            activeOpacity={0.8}
            style={[styles.modeButton, gameMode === "create" && styles.modeButtonActive]}
          >
            <BlurView intensity={gameMode === "create" ? 50 : 30} style={styles.modeButtonBlur}>
              <Text style={[styles.modeButtonText, gameMode === "create" && styles.modeButtonTextActive]}>
                Create Game
              </Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setGameMode("join")}
            activeOpacity={0.8}
            style={[styles.modeButton, gameMode === "join" && styles.modeButtonActive]}
          >
            <BlurView intensity={gameMode === "join" ? 50 : 30} style={styles.modeButtonBlur}>
              <Text style={[styles.modeButtonText, gameMode === "join" && styles.modeButtonTextActive]}>
                Join Game
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Player Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <BlurView intensity={40} style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="rgba(51, 65, 85, 0.5)"
                value={playerName}
                onChangeText={setPlayerName}
                autoCapitalize="words"
              />
            </BlurView>
          </View>

          {/* Game ID Input (only for join mode) */}
          {gameMode === "join" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Game ID</Text>
              <BlurView intensity={40} style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter game ID"
                  placeholderTextColor="rgba(51, 65, 85, 0.5)"
                  value={gameId}
                  onChangeText={setGameId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </BlurView>
            </View>
          )}

          {/* Player Count Selector (only for create mode) */}
          {gameMode === "create" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Players</Text>
              <View style={styles.playerCountContainer}>
                {([2, 3, 4] as const).map((count) => (
                  <TouchableOpacity
                    key={count}
                    onPress={() => setPlayerCount(count)}
                    activeOpacity={0.8}
                    style={[styles.playerCountButton, playerCount === count && styles.playerCountButtonActive]}
                  >
                    <BlurView
                      intensity={playerCount === count ? 50 : 30}
                      style={styles.playerCountButtonBlur}
                    >
                      <Text
                        style={[
                          styles.playerCountButtonText,
                          playerCount === count && styles.playerCountButtonTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={!isFormValid}
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          >
            <BlurView intensity={isFormValid ? 50 : 30} style={styles.submitButtonBlur}>
              <Text style={[styles.submitButtonText, !isFormValid && styles.submitButtonTextDisabled]}>
                {gameMode === "create" ? "Start Game" : "Join Game"}
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: "100%",
    maxWidth: isTablet ? 480 : 400,
    gap: 24,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    alignSelf: "center",
  },
  title: {
    color: "#334155",
    fontWeight: "bold",
    fontSize: isTablet ? 36 : 28,
    textAlign: "center",
  },
  modeToggle: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  modeButtonActive: {
    borderColor: "rgba(59, 130, 246, 0.5)",
  },
  modeButtonBlur: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonText: {
    color: "rgba(51, 65, 85, 0.7)",
    fontWeight: "600",
    fontSize: isTablet ? 16 : 14,
  },
  modeButtonTextActive: {
    color: "#3b82f6",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: "#334155",
    fontWeight: "600",
    fontSize: isTablet ? 16 : 14,
    paddingLeft: 4,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 16 : 12,
    color: "#334155",
    fontSize: isTablet ? 16 : 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  submitButtonDisabled: {
    borderColor: "rgba(148, 163, 184, 0.3)",
    opacity: 0.5,
  },
  submitButtonBlur: {
    paddingVertical: isTablet ? 18 : 16,
    paddingHorizontal: 24,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#3b82f6",
    fontWeight: "700",
    fontSize: isTablet ? 18 : 16,
  },
  submitButtonTextDisabled: {
    color: "rgba(51, 65, 85, 0.5)",
  },
  playerCountContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  playerCountButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  playerCountButtonActive: {
    borderColor: "rgba(59, 130, 246, 0.5)",
  },
  playerCountButtonBlur: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  playerCountButtonText: {
    color: "rgba(51, 65, 85, 0.7)",
    fontWeight: "600",
    fontSize: isTablet ? 18 : 16,
  },
  playerCountButtonTextActive: {
    color: "#3b82f6",
  },
})

