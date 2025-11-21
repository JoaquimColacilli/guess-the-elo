Te armo un README bien completo y profesional:
markdown# 🎯 Guess the ELO - Twitch Chat Tracker

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Real-time Twitch chat integration for **GothamChess's "Guess the ELO"** segment. Track audience predictions, calculate statistics, and declare winners — all in real-time.

![Guess the ELO Demo](./demo-screenshot.png) <!-- Add your screenshot here -->

---

## ✨ Features

- 🎮 **Real-Time Twitch Integration**: Connects to any Twitch channel via IRC
- 📊 **Live Statistics**: Tracks total guesses, average ELO, and distribution
- 👥 **Dual Panel System**: Separate interfaces for moderators and streamers
- 🏆 **Winner Detection**: Automatically calculates closest predictions and exact matches
- 🔄 **WebSocket Sync**: Instant state synchronization between all connected clients
- 🎨 **Stream-Ready UI**: Dark, modern design optimized for OBS overlays
- 🚀 **Smart Parsing**: Extracts ELO predictions (100-3500) from natural language chat

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Socket.io Client for real-time updates

**Backend:**
- Node.js + Express
- Socket.io for WebSocket connections
- tmi.js for Twitch chat integration

---

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Setup

1. **Clone the repository**
```bash
   git clone https://github.com/JoaquimColacilli/guess-the-elo.git
   cd guess-the-elo
```

2. **Install backend dependencies**
```bash
   cd server
   npm install
```

3. **Install frontend dependencies**
```bash
   cd ../client
   npm install
```

4. **Configure environment variables**
   
   Create `server/.env`:
```env
   PORT=3001
   TWITCH_CHANNEL=razhelok
   TWITCH_USERNAME=justinfan12345
   TWITCH_OAUTH_TOKEN=
```

---

## 🚀 Usage

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Navigate to:
- **Streamer Panel**: `http://localhost:5173/`
- **Moderator Panel**: `http://localhost:5173/moderator`

---

## 🎮 How It Works

### Workflow

1. **Moderator** loads the actual ELO ratings for both players (GothamChess Subscriber + Random Player)
2. **Streamer** receives notification and clicks "START ROUND"
3. **Audience** sends ELO predictions via Twitch chat (e.g., `"I think 1200"`, `"1500"`)
4. System tracks only the **latest guess per user**
5. **Streamer** finishes analyzing the game and clicks "REVEAL ELO"
6. Streamer enters their own prediction
7. **Results** display:
   - Actual ELO for both players
   - Streamer vs Audience comparison
   - Winner declaration
   - Top 5 closest predictions

### Chat Parsing

The app intelligently extracts ELO ratings from chat messages:
```
✅ "1200"           → 1200
✅ "I think 1500"   → 1500
✅ "probably 900"   → 900
❌ "hello"          → ignored
❌ "50"             → ignored (out of range)
```

---

## 📸 Screenshots

### Streamer Control Panel
![Streamer Panel](<img width="1282" height="758" alt="image" src="https://github.com/user-attachments/assets/245c83af-0395-47e1-8de7-a29c2d840543" />)

### Moderator Panel
![Moderator Panel](<img width="500" height="465" alt="image" src="https://github.com/user-attachments/assets/7dcf042d-98ed-4431-8c08-b7eb5d18ca6f" />)

### Results View
![Results](<img width="1296" height="856" alt="image" src="https://github.com/user-attachments/assets/13b9904f-efae-42fd-bc6e-ba7a8bc8031b" />)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Joaquim Colacilli**
- GitHub: [@JoaquimColacilli](https://github.com/JoaquimColacilli)
- Twitch: [razhelok](https://twitch.tv/razhelok)

---

## 🙏 Acknowledgments

- Inspired by [GothamChess's](https://www.youtube.com/@GothamChess) "Guess the ELO" series
- Built with [Antigravity IDE](https://ide.google.com) powered by Gemini 3 Pro

---

⭐ **Star this repo if you find it useful!**
