# Shithead Card Game

A multiplayer card game built with a Node.js/TypeScript backend and React Native mobile app.

## Project Structure

```
shithead_cardgame/
├── backend/          # Node.js/TypeScript backend server
│   ├── src/
│   │   ├── game/     # Game engine logic
│   │   ├── routes.ts # REST API endpoints
│   │   ├── websocket.ts # WebSocket handlers
│   │   └── ...
│   └── package.json
└── mobile-ui/        # React Native mobile app (Expo)
    ├── components/   # UI components
    ├── utils/        # API client and utilities
    └── package.json
```

## Prerequisites

- **Node.js**: v18.x or higher (v20+ recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Expo CLI**: For mobile app development (installed globally or via npx)
- **iOS Simulator** (for macOS) or **Android Emulator** (for mobile testing)

### Check Your Versions

```bash
node --version   # Should be v18.x or higher
npm --version    # Should be v9.x or higher
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shithead_cardgame
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env file with your settings (optional, defaults work for local dev)
# PORT=4000
# HOST=127.0.0.1

# Development mode (with hot reload)
npm run dev

# Or build and run production
npm run build
npm start
```

The backend will start on `http://localhost:4000` (or your configured PORT).

**Available Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production build

### 3. Mobile App Setup

```bash
cd mobile-ui

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env file with your backend URL
# EXPO_PUBLIC_API_URL=http://localhost:4000

# Start Expo development server
npm start

# Or run on specific platform
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
npm run web      # Web browser
```

**Available Scripts:**
- `npm start` - Start Expo development server
- `npm run ios` - Open in iOS Simulator
- `npm run android` - Open in Android Emulator
- `npm run web` - Open in web browser
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

### Backend (`.env` in `backend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port number |
| `HOST` | `127.0.0.1` | Server host (use `0.0.0.0` for EC2/production) |

### Mobile App (`.env` in `mobile-ui/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |

**Note:** For mobile devices, use your computer's local IP address instead of `localhost`:
- macOS/Linux: `ifconfig | grep "inet "` (look for your local network IP)
- Windows: `ipconfig` (look for IPv4 Address)
- Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:4000`

## API Endpoints

### REST API

- `POST /games` - Create a new game
- `POST /games/:gameId/join` - Join an existing game
- `POST /games/:gameId/start` - Start a game
- `GET /games/:gameId/state` - Get current game state

### WebSocket

- `ws://localhost:4000/ws` - WebSocket connection for real-time game updates

## Development

### Backend Development

The backend uses TypeScript and Fastify. Game state is stored in memory (Map-based).

**Key Files:**
- `src/server.ts` - Server setup and configuration
- `src/routes.ts` - REST API routes
- `src/websocket.ts` - WebSocket message handlers
- `src/gameStore.ts` - Game state management
- `src/game/GameEngine.ts` - Core game logic

### Mobile App Development

The mobile app uses React Native with Expo, TypeScript, and NativeWind (Tailwind CSS).

**Key Files:**
- `App.tsx` - Main app component
- `components/` - UI components
- `utils/apiClient.ts` - API client for backend communication

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

For EC2 deployment:
1. Set `HOST=0.0.0.0` in `.env` or environment variables
2. Open port in EC2 security group
3. Use process manager (PM2, systemd, etc.)

### Mobile App

```bash
cd mobile-ui
npm run prebuild  # Generate native projects
# Then build with EAS or native tools
```

## Troubleshooting

### Backend won't start
- Check if port 4000 is already in use: `lsof -i :4000`
- Verify Node.js version: `node --version`
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Mobile app can't connect to backend
- Ensure backend is running
- Check `EXPO_PUBLIC_API_URL` matches backend URL
- For physical devices, use your computer's local IP, not `localhost`
- Check firewall settings

### TypeScript errors
- Run `npm run build` in backend to check for errors
- Ensure all dependencies are installed: `npm install`

## Dependencies

### Backend
- `fastify` - Web framework
- `@fastify/websocket` - WebSocket support
- `@fastify/cors` - CORS middleware
- `uuid` - UUID generation

### Mobile App
- `expo` - React Native framework
- `react-native` - React Native core
- `nativewind` - Tailwind CSS for React Native
- `react-native-gesture-handler` - Gesture handling
- `react-native-reanimated` - Animations

See `package.json` files in each directory for complete dependency lists.

## License

[Your License Here]

