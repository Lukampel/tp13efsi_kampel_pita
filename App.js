import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './src/context/GameContext';
import GameScreen from './src/screens/GameScreen';
import StartScreen from './src/screens/StartScreen';
import { colors } from './src/theme';

function Screens() {
  const { screen } = useGame();
  return screen === 'playing' ? <GameScreen /> : <StartScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Screens />
          </KeyboardAvoidingView>
          <StatusBar style="light" />
        </SafeAreaView>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
});
