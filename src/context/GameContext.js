import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLAGS_URL = 'https://countriesnow.space/api/v0.1/countries/flag/images';
const CAPITALS_URL = 'https://countriesnow.space/api/v0.1/countries/capital';
const LEADERBOARD_KEY = 'leaderboard';

export const ROUND_SECONDS = 15;
export const HINT_COST_SECONDS = 2;
export const AUTO_HINT_EVERY = 5;
export const CORRECT_POINTS = 10;
export const WRONG_POINTS = -1;

const GameContext = createContext(null);

// Saca tildes, mayúsculas y espacios de más para comparar respuestas
export const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Las banderas vienen en SVG (Image de React Native no los dibuja), así que
// pedimos a Wikimedia la miniatura PNG del mismo archivo.
const toPngUrl = (rawUrl) => {
  const url = rawUrl.trim();
  if (url.includes('/thumb/')) return url.replace(/\/\d+px-/, '/330px-');
  const match = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/(.+\/([^/]+\.svg))$/);
  if (!match) return url;
  const [, base, path, file] = match;
  return `${base}/thumb/${path}/330px-${file}.png`;
};

export function GameProvider({ children }) {
  // Datos de la API
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Partida
  const [screen, setScreen] = useState('menu'); // 'menu' | 'playing'
  const [mode, setMode] = useState('flags'); // 'flags' | 'capitals'
  const [playerName, setPlayerName] = useState('');
  const [currentCountry, setCurrentCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'ok' | 'bad' | 'timeout', text }

  // Timer
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [elapsed, setElapsed] = useState(0);

  // Pistas
  const [revealedIndexes, setRevealedIndexes] = useState([]); // modo banderas
  const [capitalOptions, setCapitalOptions] = useState([]); // modo capitales
  const [removedOptions, setRemovedOptions] = useState([]);

  // Ranking
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [flagsRes, capitalsRes] = await Promise.all([fetch(FLAGS_URL), fetch(CAPITALS_URL)]);
      const flagsJson = await flagsRes.json();
      const capitalsJson = await capitalsRes.json();

      const capitalByIso = {};
      capitalsJson.data.forEach((c) => {
        if (c.capital) capitalByIso[c.iso2] = c.capital.trim();
      });

      const list = flagsJson.data
        .filter((c) => c.name && c.flag)
        .map((c) => ({
          name: c.name.trim(),
          iso2: c.iso2,
          flag: toPngUrl(c.flag),
          originalFlag: c.flag,
          capital: capitalByIso[c.iso2] ?? null,
        }));

      setCountries(list);
    } catch (e) {
      setError('No se pudieron cargar los países. Revisá la conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Al montar la app: traer países y ranking guardado
  useEffect(() => {
    fetchCountries();
    AsyncStorage.getItem(LEADERBOARD_KEY)
      .then((saved) => saved && setLeaderboard(JSON.parse(saved)))
      .catch(() => {});
  }, [fetchCountries]);

  const capitalCountries = useMemo(() => countries.filter((c) => c.capital), [countries]);
  const pool = mode === 'capitals' ? capitalCountries : countries;

  // Elegir un país nuevo al azar y reiniciar la ronda
  const nextCountry = useCallback(
    (list = pool) => {
      if (list.length === 0) return;
      let next = randomItem(list);
      if (currentCountry && list.length > 1) {
        while (next.name === currentCountry.name) next = randomItem(list);
      }
      setCurrentCountry(next);
      setTimeLeft(ROUND_SECONDS);
      setElapsed(0);
      setRevealedIndexes([]);
      setRemovedOptions([]);

      if (mode === 'capitals') {
        const wrong = shuffle(
          [...new Set(capitalCountries.map((c) => c.capital))].filter((cap) => cap !== next.capital)
        ).slice(0, 2);
        setCapitalOptions(shuffle([next.capital, ...wrong]));
      } else {
        setCapitalOptions([]);
      }
    },
    [pool, currentCountry, mode, capitalCountries]
  );

  // Arrancar a jugar apenas llegan los países (y cada vez que se cambia de modo)
  useEffect(() => {
    if (screen === 'playing' && !currentCountry && pool.length > 0) nextCountry();
  }, [screen, currentCountry, pool, nextCountry]);

  const startGame = (name, selectedMode) => {
    setPlayerName(name.trim());
    setMode(selectedMode);
    setScore(0);
    setRoundsPlayed(0);
    setFeedback(null);
    setCurrentCountry(null); // el efecto de arriba elige el primero
    setScreen('playing');
  };

  const saveToLeaderboard = async (entry) => {
    const others = leaderboard.filter(
      (e) => !(normalize(e.name) === normalize(entry.name) && e.mode === entry.mode)
    );
    const previous = leaderboard.find(
      (e) => normalize(e.name) === normalize(entry.name) && e.mode === entry.mode
    );
    const merged = previous
      ? {
          ...previous,
          best: Math.max(previous.best, entry.score),
          games: previous.games + 1,
          last: entry.score,
        }
      : { name: entry.name, mode: entry.mode, best: entry.score, games: 1, last: entry.score };
    const updated = [...others, merged].sort((a, b) => b.best - a.best);
    setLeaderboard(updated);
    try {
      await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    } catch {}
  };

  const endGame = async () => {
    if (roundsPlayed > 0 || score !== 0) {
      await saveToLeaderboard({ name: playerName, mode, score });
    }
    setScreen('menu');
    setCurrentCountry(null);
  };

  const resetScore = () => setScore(0);

  const clearLeaderboard = async () => {
    setLeaderboard([]);
    try {
      await AsyncStorage.removeItem(LEADERBOARD_KEY);
    } catch {}
  };

  const handleCorrect = () => {
    const earned = CORRECT_POINTS + timeLeft;
    setScore((s) => s + earned);
    setRoundsPlayed((r) => r + 1);
    const answer = mode === 'capitals' ? `${currentCountry.capital} (${currentCountry.name})` : currentCountry.name;
    setFeedback({ type: 'ok', text: `¡Correcto! ${answer}. +${CORRECT_POINTS} +${timeLeft}s de bonus` });
    nextCountry();
  };

  const handleWrong = (text) => {
    setScore((s) => s + WRONG_POINTS);
    setFeedback({ type: 'bad', text });
  };

  // Modo banderas: se acepta cualquier país con la misma bandera (ej: Francia / Reunión)
  const guess = (answer) => {
    if (!currentCountry || !answer.trim()) return false;
    const guessed = normalize(answer);
    const isCorrect = countries.some(
      (c) => c.originalFlag === currentCountry.originalFlag && normalize(c.name) === guessed
    );
    if (isCorrect) handleCorrect();
    else handleWrong(`"${answer.trim()}" no es correcto. ${WRONG_POINTS} punto`);
    return isCorrect;
  };

  // Modo capitales
  const guessCapital = (capital) => {
    if (!currentCountry || removedOptions.includes(capital)) return;
    if (capital === currentCountry.capital) {
      handleCorrect();
    } else {
      setRemovedOptions((r) => [...r, capital]);
      handleWrong(`${capital} no es la capital. ${WRONG_POINTS} punto`);
    }
  };

  const revealLetter = useCallback(() => {
    if (!currentCountry) return;
    const name = currentCountry.name;
    setRevealedIndexes((revealed) => {
      const hidden = name
        .split('')
        .map((ch, i) => i)
        .filter((i) => /[a-zA-ZÀ-ÿ]/.test(name[i]) && !revealed.includes(i));
      if (hidden.length <= 1) return revealed; // no regalamos la última letra
      return [...revealed, randomItem(hidden)];
    });
  }, [currentCountry]);

  const removeWrongOption = useCallback(() => {
    if (!currentCountry) return;
    setRemovedOptions((removed) => {
      const wrongLeft = capitalOptions.filter(
        (opt) => opt !== currentCountry.capital && !removed.includes(opt)
      );
      if (wrongLeft.length === 0) return removed;
      return [...removed, randomItem(wrongLeft)];
    });
  }, [currentCountry, capitalOptions]);

  const autoHint = mode === 'capitals' ? removeWrongOption : revealLetter;

  // Pista a pedido: cuesta 2 segundos del timer
  const requestHint = () => {
    if (timeLeft <= HINT_COST_SECONDS) return;
    autoHint();
    setTimeLeft((t) => Math.max(1, t - HINT_COST_SECONDS));
  };

  const hintsAvailable =
    mode === 'capitals'
      ? capitalOptions.some((opt) => currentCountry && opt !== currentCountry.capital && !removedOptions.includes(opt))
      : true;

  // Cuenta regresiva
  useEffect(() => {
    if (screen !== 'playing' || !currentCountry) return;
    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [screen, currentCountry]);

  // Pista automática cada 5 segundos
  useEffect(() => {
    if (elapsed > 0 && elapsed % AUTO_HINT_EVERY === 0) autoHint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  // Se terminó el tiempo: mostrar la respuesta y pasar al siguiente
  useEffect(() => {
    if (screen !== 'playing' || !currentCountry || timeLeft > 0) return;
    const answer = mode === 'capitals' ? `${currentCountry.capital} (${currentCountry.name})` : currentCountry.name;
    setFeedback({ type: 'timeout', text: `¡Se acabó el tiempo! Era ${answer}` });
    setRoundsPlayed((r) => r + 1);
    nextCountry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const skipCountry = () => {
    if (!currentCountry) return;
    setFeedback({ type: 'timeout', text: `Salteada. Era ${currentCountry.name}` });
    setRoundsPlayed((r) => r + 1);
    nextCountry();
  };

  const value = {
    // datos
    countries,
    loading,
    error,
    fetchCountries,
    capitalsAvailable: capitalCountries.length >= 3,
    // partida
    screen,
    mode,
    playerName,
    currentCountry,
    score,
    roundsPlayed,
    feedback,
    startGame,
    endGame,
    guess,
    guessCapital,
    nextCountry,
    skipCountry,
    resetScore,
    // timer
    timeLeft,
    // pistas
    revealedIndexes,
    capitalOptions,
    removedOptions,
    requestHint,
    hintsAvailable,
    // ranking
    leaderboard,
    clearLeaderboard,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame tiene que usarse dentro de <GameProvider>');
  return ctx;
}
