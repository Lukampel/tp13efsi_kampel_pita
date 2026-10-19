import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGame } from '../context/GameContext';
import Leaderboard from '../components/Leaderboard';
import { colors } from '../theme';

export default function StartScreen() {
  const { loading, error, fetchCountries, countries, capitalsAvailable, startGame, playerName } = useGame();
  const [name, setName] = useState(playerName);
  const [mode, setMode] = useState('flags');

  const canStart = name.trim().length > 0 && countries.length > 0 && (mode === 'flags' || capitalsAvailable);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>🏳️ Fun with Flags</Text>
      <Text style={styles.subtitle}>Adiviná el país (o su capital) a partir de la bandera</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre del jugador</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Sheldon"
          placeholderTextColor={colors.muted}
          maxLength={20}
        />

        <Text style={styles.label}>Modo de juego</Text>
        <View style={styles.modes}>
          {[
            ['flags', '🌍 Banderas', 'Escribí el país'],
            ['capitals', '🏛️ Capitales', 'Elegí entre 3 opciones'],
          ].map(([key, label, desc]) => (
            <Pressable key={key} onPress={() => setMode(key)} style={[styles.mode, mode === key && styles.modeActive]}>
              <Text style={styles.modeLabel}>{label}</Text>
              <Text style={styles.modeDesc}>{desc}</Text>
            </Pressable>
          ))}
        </View>

        {loading && (
          <View style={styles.status}>
            <ActivityIndicator color={colors.text} />
            <Text style={styles.statusText}>Cargando países...</Text>
          </View>
        )}
        {error && (
          <View style={styles.status}>
            <Text style={[styles.statusText, { color: colors.bad }]}>{error}</Text>
            <Pressable onPress={fetchCountries}>
              <Text style={styles.retry}>Reintentar</Text>
            </Pressable>
          </View>
        )}
        {!loading && !error && (
          <Text style={styles.statusText}>{countries.length} países cargados</Text>
        )}

        <Pressable
          disabled={!canStart}
          onPress={() => startGame(name, mode)}
          style={({ pressed }) => [styles.start, !canStart && { opacity: 0.4 }, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.startText}>Jugar</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Reglas</Text>
        <Text style={styles.rule}>✅ Acierto: +10 puntos + los segundos que sobran</Text>
        <Text style={styles.rule}>❌ Error: -1 punto</Text>
        <Text style={styles.rule}>⏱️ 15 segundos por bandera</Text>
        <Text style={styles.rule}>💡 Pedir una pista descuenta 2 segundos</Text>
      </View>

      <Leaderboard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  subtitle: { color: colors.muted, textAlign: 'center', marginBottom: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 10 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.cardLight,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  modes: { flexDirection: 'row', gap: 8 },
  mode: { flex: 1, backgroundColor: colors.cardLight, borderRadius: 12, padding: 12, borderWidth: 2, borderColor: 'transparent' },
  modeActive: { borderColor: colors.primary },
  modeLabel: { color: colors.text, fontSize: 16, fontWeight: '800' },
  modeDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { color: colors.muted, fontSize: 13 },
  retry: { color: colors.primary, fontWeight: '800' },
  start: { backgroundColor: colors.ok, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  startText: { color: colors.bg, fontSize: 18, fontWeight: '900' },
  rule: { color: colors.text, fontSize: 14 },
});
