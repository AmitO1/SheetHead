# How to Run Shithead Card Game

## Prerequisites
- Node.js (>=18)
- npm (>=9)
- Expo Go app on your mobile device (for testing UI)

## 1. Backend Server
The backend controls the game logic and state.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000` (or similar).

### Backend Endpoints Available:
- POST `/games` - Create a new game
- POST `/games/:gameId/join` - Join a game
- POST `/games/:gameId/start` - Start the game
- GET `/games/:gameId/state` - Get current state
- WS `/ws` - WebSocket for game events

## 2. Mobile UI
The mobile application (client).

1. Navigate to the mobile-ui directory:
   ```bash
   cd mobile-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with your phone (using Expo Go) or press `i` to open in iOS Simulator / `a` for Android Emulator.

## 3. Current Status & Missing Parts
### What You Have:
- **Backend:** robust game server with game engine, WebSocket support, and REST APIs.
- **Mobile UI:** React Native screen with NativeWind styling.

### What is Missing (The "Plugging In" Part):
1. **Network Layer in UI:** The UI does not currently have any code to communicate with the backend.
   - Needs a module to `fetch` endpoints (create/join game).
   - Needs a WebSocket connection to handle real-time game updates.
2. **State Management:** The UI needs to store the `gameId`, `playerId`, and current `GameState` received from the server.
3. **Game Loop:** The UI needs to listen for `GAME_STATE_UPDATE` events and re-render the screen accordingly.

## Next Steps to Connect Them:
1. Create a `api.ts` in `mobile-ui` to handle REST calls.
2. Create a `socket.ts` in `mobile-ui` to handle WebSocket messages.
3. Update `App.tsx` (or creating a GameScreen) to use these services.
