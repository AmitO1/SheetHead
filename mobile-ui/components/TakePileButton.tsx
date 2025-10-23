import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { BlurView } from "expo-blur"

interface TakePileButtonProps {
  onPress: () => void
}

export function TakePileButton({ onPress }: TakePileButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={50} style={styles.button}>
        <Text style={styles.buttonText}>Take Pile</Text>
      </BlurView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(239,68,68,0.2)",
    overflow: "hidden",
  },
  buttonText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 10,
  },
})
