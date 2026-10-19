import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { normalize, useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function GuessForm() {
  const { countries, currentCountry, guess } = useGame();
  const [text, setText] = useState('');

  // Limpiar el input cuando cambia la bandera
  useEffect(() => setText(''), [currentCountry]);

  const query = normalize(text);
  const suggestions =
    query.length >= 2
      ? [...new Set(countries.map((c) => c.name))]
          .filter((name) => normalize(name).includes(query))
          .sort((a, b) => normalize(a).indexOf(query) - normalize(b).indexOf(query))
          .slice(0, 4)
      : [];

  const submit = (answer) => {
    const ok = guess(answer);
    if (!ok) setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="¿De qué país es la bandera?"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="send"
          onSubmitEditing={() => submit(text)}
          submitBehavior="submit"
        />
        <Pressable
          onPress={() => submit(text)}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.buttonText}>Arriesgar</Text>
        </Pressable>
      </View>
      {suggestions.map((name) => (
        <Pressable
          key={name}
          onPress={() => submit(name)}
          style={({ pressed }) => [styles.suggestion, pressed && { backgroundColor: colors.cardLight }]}
        >
          <Text style={styles.suggestionText}>{name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: colors.text, fontWeight: '800' },
  suggestion: { backgroundColor: colors.card, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  suggestionText: { color: colors.text, fontSize: 15 },
});
