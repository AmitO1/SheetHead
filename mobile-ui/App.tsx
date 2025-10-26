import { View, StatusBar, StyleSheet } from "react-native"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { GameBoard } from "./components/GameBoard"
import { LinearGradient } from "expo-linear-gradient"

function AppContent() {
  const insets = useSafeAreaInsets()
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#f0f9ff", "#e2e8f0", "#dbeafe"]} style={styles.gradient}>
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <GameBoard />
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
