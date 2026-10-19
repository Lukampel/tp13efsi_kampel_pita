import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../context/GameContext';
import CapitalOptions from '../components/CapitalOptions';
import Feedback from '../components/Feedback';
import Flag from '../components/Flag';
import GuessForm from '../components/GuessForm';
import Hint from '../components/Hint';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import { colors } from '../theme';

export default function GameScreen() {
  const { mode, currentCountry, endGame, skipCountry } = useGame();

  if (!currentCountry) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.text} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ScoreBoard />
      <Timer />
      <Flag />
      <Feedback />
      <Hint />
      {mode === 'capitals' ? <CapitalOptions /> : <GuessForm />}

      <View style={styles.actions}>
        <Pressable onPress={skipCountry} style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}>
          <Text style={styles.secondaryText}>Saltear ⏭️</Text>
        </Pressable>
        <Pressable onPress={endGame} style={({ pressed }) => [styles.end, pressed && { opacity: 0.7 }]}>
          <Text style={styles.endText}>Terminar y guardar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center' },
  container: { padding: 16, gap: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  secondary: { flex: 1, backgroundColor: colors.cardLight, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: colors.text, fontWeight: '700' },
  end: { flex: 1, backgroundColor: colors.bad, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  endText: { color: colors.text, fontWeight: '800' },
});
