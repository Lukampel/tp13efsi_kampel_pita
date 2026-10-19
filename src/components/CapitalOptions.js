import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function CapitalOptions() {
  const { currentCountry, capitalOptions, removedOptions, guessCapital } = useGame();
  if (!currentCountry) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>¿Cuál es la capital de este país?</Text>
      {capitalOptions.map((capital) => {
        const removed = removedOptions.includes(capital);
        return (
          <Pressable
            key={capital}
            disabled={removed}
            onPress={() => guessCapital(capital)}
            style={({ pressed }) => [styles.option, removed && styles.removed, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.optionText, removed && styles.removedText]}>{capital}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  question: { color: colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  option: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  optionText: { color: colors.text, fontSize: 17, fontWeight: '700' },
  removed: { backgroundColor: colors.card },
  removedText: { color: colors.muted, textDecorationLine: 'line-through' },
});
