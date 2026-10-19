# TP13 – Fun with Flags 🏳️

Juego móvil hecho con React Native + Expo. Kampel – Pita.

## Cómo correrlo en el celular

```bash
npm install
npx expo start
```

Escanear el QR con **Expo Go** (Android: desde la app; iPhone: con la cámara). El celular y la compu tienen que estar en la misma red; si no, usar `npx expo start --tunnel`.

## Qué hace

- Al montar la app (`useEffect`) se traen todos los países de la API de banderas (y las capitales) y se guardan en un state.
- Se elige un país al azar y se muestra su bandera.
- **Acierto:** +10 puntos + los segundos que quedan del timer. **Error:** -1 punto.

### Plus implementados

- **Timer de 15s** por bandera. Si se acaba, se muestra la respuesta y pasa a la siguiente.
- **Multijugador con ranking:** se ingresa un nombre antes de jugar; al terminar se guarda el mejor puntaje de cada jugador por modo. El ranking se persiste con `AsyncStorage` (el equivalente de `localStorage` en el celular, que no existe en React Native).
- **Pistas:** cada 5s se revela una letra al azar del nombre, o se puede pedir una con el botón (descuenta 2s).
- **Modo Capitales:** 3 opciones de capital por bandera; cada 5s (o a pedido, -2s) se borra una opción incorrecta.

## Estructura

Todo el estado y la lógica viven en `src/context/GameContext.js` (`createContext` + `useContext`), expuesto con `<GameProvider>` que envuelve la app. Ningún componente recibe datos del juego por props: todos usan el hook `useGame()`.

```
App.js                      <GameProvider> + elige pantalla
src/context/GameContext.js  estado: países, país actual, puntaje, jugador, timer, pistas, ranking
src/screens/StartScreen.js  nombre, modo y ranking
src/screens/GameScreen.js   pantalla de juego
src/components/
  Flag.js            bandera actual
  GuessForm.js       input con sugerencias (modo banderas)
  CapitalOptions.js  3 opciones (modo capitales)
  ScoreBoard.js      jugador y puntaje
  Timer.js           cuenta regresiva
  Hint.js            pistas
  Feedback.js        mensaje de acierto / error
  Leaderboard.js     tabla de posiciones
```

### Nota sobre las banderas

La API devuelve las banderas como SVG de Wikimedia, y el componente `Image` de React Native no dibuja SVG. Por eso se usa la miniatura PNG que genera Wikimedia del mismo archivo; si alguna falla, se usa `flagcdn.com` con el código ISO del país.
