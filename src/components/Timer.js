import { StyleSheet, Text, View } from 'react-native';
import { ROUND_SECONDS, useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function Timer() {
  const { timeLeft } = useGame();
  const seconds = Math.max(0, timeLeft);
  const color = seconds > 8 ? colors.ok : seconds > 4 ? colors.warn : colors.bad;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${(seconds / ROUND_SECONDS) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.text, { color }]}>{seconds}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.cardLight, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5 },
  text: { width: 40, textAlign: 'right', fontSize: 18, fontWeight: '800' },
});
