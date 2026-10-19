import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AUTO_HINT_EVERY, HINT_COST_SECONDS, useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function Hint() {
  const { mode, currentCountry, revealedIndexes, requestHint, hintsAvailable, timeLeft } = useGame();
  if (!currentCountry) return null;

  const disabled = !hintsAvailable || timeLeft <= HINT_COST_SECONDS;

  return (
    <View style={styles.container}>
      {mode === 'flags' && (
        <Text style={styles.word}>
          {currentCountry.name
            .split('')
            .map((ch, i) => (/[a-zA-ZÀ-ÿ]/.test(ch) && !revealedIndexes.includes(i) ? '_' : ch))
            .join(' ')}
        </Text>
      )}
      <View style={styles.row}>
        <Text style={styles.info}>
          {mode === 'flags'
            ? `Se revela una letra cada ${AUTO_HINT_EVERY}s`
            : `Se borra una opción cada ${AUTO_HINT_EVERY}s`}
        </Text>
        <Pressable
          onPress={requestHint}
          disabled={disabled}
          style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.buttonText}>💡 Pista (-{HINT_COST_SECONDS}s)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.card, borderRadius: 16, padding: 12, gap: 10 },
  word: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  info: { color: colors.muted, fontSize: 12, flex: 1 },
  button: { backgroundColor: colors.warn, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  disabled: { opacity: 0.4 },
  buttonText: { color: colors.bg, fontWeight: '800' },
});
