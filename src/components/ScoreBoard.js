import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function ScoreBoard() {
  const { playerName, score, roundsPlayed, mode } = useGame();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>Jugador</Text>
        <Text style={styles.player}>{playerName}</Text>
        <Text style={styles.label}>
          {mode === 'capitals' ? 'Modo Capitales' : 'Modo Banderas'} · Ronda {roundsPlayed + 1}
        </Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.label}>Puntaje</Text>
        <Text style={[styles.score, score < 0 && { color: colors.bad }]}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  label: { color: colors.muted, fontSize: 12 },
  player: { color: colors.text, fontSize: 18, fontWeight: '700', marginVertical: 2 },
  scoreBox: { alignItems: 'flex-end' },
  score: { color: colors.ok, fontSize: 34, fontWeight: '800' },
});
