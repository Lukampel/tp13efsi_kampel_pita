import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { leaderboard, clearLeaderboard } = useGame();
  const [tab, setTab] = useState('flags');

  const rows = leaderboard.filter((e) => e.mode === tab).slice(0, 10);

  const confirmClear = () =>
    Alert.alert('Borrar ranking', '¿Seguro que querés borrar todas las posiciones?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: clearLeaderboard },
    ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Ranking</Text>
        {leaderboard.length > 0 && (
          <Pressable onPress={confirmClear}>
            <Text style={styles.clear}>Borrar</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabs}>
        {[
          ['flags', 'Banderas'],
          ['capitals', 'Capitales'],
        ].map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, tab === key && styles.tabActive]}>
            <Text style={styles.tabText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {rows.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay partidas en este modo</Text>
      ) : (
        rows.map((row, i) => (
          <View key={row.name} style={styles.row}>
            <Text style={styles.pos}>{MEDALS[i] ?? `${i + 1}.`}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{row.name}</Text>
              <Text style={styles.detail}>
                {row.games} {row.games === 1 ? 'partida' : 'partidas'} · última: {row.last}
              </Text>
            </View>
            <Text style={styles.best}>{row.best}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  clear: { color: colors.bad, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.cardLight, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.text, fontWeight: '700' },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  pos: { width: 30, fontSize: 18, color: colors.text, textAlign: 'center' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  detail: { color: colors.muted, fontSize: 12 },
  best: { color: colors.ok, fontSize: 20, fontWeight: '800' },
});
