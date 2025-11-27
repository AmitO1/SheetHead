import { View, Text, StyleSheet, Dimensions } from "react-native"
import { BlurView } from "expo-blur"
import { PlayingCard } from "./PlayingCard"
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg"

const { width } = Dimensions.get("window")
const isTablet = width >= 768

interface Player {
  id: number
  name: string
  avatar: string
  isCurrentPlayer: boolean
}

interface PlayerAreaProps {
  player: Player
  position: "top" | "bottom"
  timerProgress: number
}

export function PlayerArea({ player, position, timerProgress }: PlayerAreaProps) {
  const isTop = position === "top"
  const avatarSize = isTop ? (isTablet ? 48 : 32) : isTablet ? 64 : 44
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - timerProgress / 100)

  return (
    <View style={styles.container}>
      {/* Avatar with Timer Ring */}
      <View style={styles.avatarContainer}>
        <Svg width={avatarSize} height={avatarSize} viewBox="0 0 48 48" style={styles.timerRing}>
          <Defs>
            <LinearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(66, 5, 86, 0.6)" />
              <Stop offset="100%" stopColor="rgba(212, 199, 222, 0.6)" />
            </LinearGradient>
          </Defs>
          <Circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="3" />
          <Circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="24, 24"
          />
        </Svg>
        <View
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <BlurView intensity={20} style={styles.avatarBlur}>
            <Text style={[styles.avatarText, isTop && styles.avatarTextSmall]}>{player.name.charAt(0)}</Text>
          </BlurView>
        </View>
      </View>

      {/* Player Name */}
      <BlurView intensity={30} style={styles.nameContainer}>
        <Text style={[styles.nameText, isTop && styles.nameTextSmall]}>{player.name}</Text>
      </BlurView>

      {/* Cards Area */}
      <View style={styles.cardsArea}>
        {/* Face-down cards */}
        <View style={[styles.cardRow, isTop && styles.cardRowSmall]}>
          <PlayingCard faceDown size={isTop ? "xs" : "sm"} />
          <PlayingCard faceDown size={isTop ? "xs" : "sm"} />
          <PlayingCard faceDown size={isTop ? "xs" : "sm"} />
        </View>

        {/* Face-up cards */}
        <View
          style={[
            styles.cardRow,
            isTop && styles.cardRowSmall,
            { marginTop: isTop ? (isTablet ? -36 : -24) : isTablet ? -56 : -36 },
          ]}
        >
          <PlayingCard value="7" suit="♠" color="black" size={isTop ? "xs" : "sm"} />
          <PlayingCard value="9" suit="♥" color="red" size={isTop ? "xs" : "sm"} />
          <PlayingCard value="K" suit="♣" color="black" size={isTop ? "xs" : "sm"} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  avatarContainer: {
    position: "relative",
  },
  timerRing: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  avatar: {
    borderWidth: 2,
    borderColor: "rgba(66, 5, 86, 0.16)",
    overflow: "hidden",
  },
  avatarBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(66, 5, 86, 0.16)",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  avatarTextSmall: {
    fontSize: 12,
  },
  nameContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  nameText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 12,
  },
  nameTextSmall: {
    fontSize: 9,
  },
  cardsArea: {
    alignItems: "center",
    gap: 2,
  },
  cardRow: {
    flexDirection: "row",
    gap: 4,
  },
  cardRowSmall: {
    gap: 2,
  },
})
