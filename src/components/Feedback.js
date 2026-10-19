import { StyleSheet, Text } from 'react-native';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

const COLORS = { ok: colors.ok, bad: colors.bad, timeout: colors.warn };

export default function Feedback() {
  const { feedback } = useGame();
  if (!feedback) return null;

  return <Text style={[styles.text, { color: COLORS[feedback.type] }]}>{feedback.text}</Text>;
}

const styles = StyleSheet.create({
  text: { textAlign: 'center', fontSize: 15, fontWeight: '700' },
});
