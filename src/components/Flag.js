import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useGame } from '../context/GameContext';
import { colors } from '../theme';

// Wikimedia rechaza el User-Agent por defecto de Android, así que mandamos uno propio
const HEADERS = { 'User-Agent': 'TP13FlagsGame/1.0 (React Native school project)' };

export default function Flag() {
  const { currentCountry } = useGame();
  const [useFallback, setUseFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUseFallback(false);
    setLoaded(false);
  }, [currentCountry]);

  if (!currentCountry) return null;

  // Si la imagen de la API falla, usamos flagcdn con el código ISO
  const uri = useFallback
    ? `https://flagcdn.com/w320/${currentCountry.iso2.toLowerCase()}.png`
    : currentCountry.flag;

  return (
    <View style={styles.wrapper}>
      {!loaded && <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.text} />}
      <Image
        key={uri}
        source={{ uri, headers: HEADERS }}
        style={styles.flag}
        resizeMode="contain"
        onLoad={() => setLoaded(true)}
        onError={() => !useFallback && setUseFallback(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 190,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
  },
  flag: { width: '100%', height: '100%' },
});
