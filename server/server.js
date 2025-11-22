require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const twitchClient = require('./src/config/twitch');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./auth/passport');
const authRoutes = require('./routes/auth');
const { parseElo, calculateStats, calculateResults } = require('./src/utils/gameLogic');

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use('/auth', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// --- GAME STATE MANAGEMENT ---
let gameState = 'WAITING';

// Game Data
let gothamSubELO = null;    // Target for comparison
let randomPlayerELO = null; // Just for display
let elosLocked = false;

let streamerGuess = null;    // Set by Streamer AT REVEAL
const audienceGuesses = new Map(); // username -> elo

function broadcastState() {
    io.emit('game_state', {
        state: gameState,
        elosLocked,
        hasStreamerGuess: !!streamerGuess
    });
}

function broadcastStats() {
    io.emit('game_stats', calculateStats(audienceGuesses));
}

// --- SOCKET CONNECTION ---

let connectedClients = 0;

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Cliente conectado. ID: ${socket.id}. Total: ${connectedClients}`);

    // Send initial state
    socket.emit('server_status', {
        status: 'online',
        twitchConnected: twitchClient.readyState() === 'OPEN'
    });

    // Send specific twitch status for UI indicators
    socket.emit('twitch_status', {
        connected: twitchClient.readyState() === 'OPEN'
    });

    // Send current game state immediately on connection
    socket.emit('game_state', {
        state: gameState,
        elosLocked,
        hasStreamerGuess: !!streamerGuess
    });
    socket.emit('game_stats', calculateStats(audienceGuesses));

    // If round is revealed, send results to new client
    if (gameState === 'REVEALED' && streamerGuess !== null) {
        socket.emit('round_result', calculateResults(gothamSubELO, streamerGuess, audienceGuesses));
    }

    // --- MODERATOR EVENTS ---

    socket.on('admin_set_elos', (data) => {
        // data = { gothamSub: 1200, randomPlayer: 1300 }
        if (gameState !== 'WAITING' && gameState !== 'READY') return;

        gothamSubELO = parseInt(data.gothamSub, 10);
        randomPlayerELO = parseInt(data.randomPlayer, 10);
        elosLocked = true;

        gameState = 'READY';
        streamerGuess = null;
        audienceGuesses.clear();

        console.log(`👮 Moderator set ELOs - Sub: ${gothamSubELO}, Random: ${randomPlayerELO}`);

        broadcastState();
        broadcastStats();

        // Explicit event for synchronization
        io.emit('elos_loaded', {
            gothamSubELO,
            randomPlayerELO
        });

        // Notify Streamer
        io.emit('notification', {
            type: 'success',
            message: '✅ Match ELOs loaded. Ready to start!'
        });
    });

    // --- STREAMER EVENTS ---

    socket.on('start_round', () => {
        if (gameState !== 'READY') return;

        gameState = 'GUESSING';
        console.log('▶ Round Started');

        broadcastState();
        io.emit('round_started');

        io.emit('chat_message', {
            user: 'SYSTEM',
            text: '📢 Round Started! Type your ELO guesses now!',
            isSystem: true,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('reveal_round', (guess) => {
        if (gameState !== 'GUESSING') return;

        streamerGuess = parseInt(guess, 10);
        gameState = 'REVEALED';

        const results = calculateResults(gothamSubELO, streamerGuess, audienceGuesses);
        console.log(`🏆 Round Revealed. Streamer guessed: ${streamerGuess}`);

        broadcastState();
        io.emit('round_result', results);

        io.emit('chat_message', {
            user: 'SYSTEM',
            text: `🏆 Round Ended! Gotham Sub ELO: ${gothamSubELO}. Winner: ${results.winner}!`,
            isSystem: true,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('reset_round', () => {
        gameState = 'WAITING';
        gothamSubELO = null;
        randomPlayerELO = null;
        elosLocked = false;
        streamerGuess = null;
        audienceGuesses.clear();

        console.log('🔄 Round Reset');

        broadcastState();
        broadcastStats();
        io.emit('round_result', null);

        // Explicit event for synchronization
        io.emit('round_reset');
    });

    socket.on('disconnect', () => {
        connectedClients--;
        console.log(`Cliente desconectado. ID: ${socket.id}`);
    });
});

// --- TWITCH CHAT HANDLER ---

twitchClient.on('message', (channel, tags, message, self) => {
    if (self) return;

    const username = tags['display-name'];

    // Parse ELO using utility
    const guessValue = parseElo(message);
    const isGuess = !!guessValue;

    // Only accept guesses if game is ACTIVE (GUESSING state)
    if (isGuess && gameState === 'GUESSING') {
        // Update user guess (only latest counts)
        audienceGuesses.set(username, guessValue);

        // Broadcast new stats
        broadcastStats();
    }

    // Broadcast chat message with metadata
    io.emit('chat_message', {
        user: username,
        text: message,
        isGuess,
        guessValue,
        timestamp: new Date().toISOString()
    });
});

twitchClient.on('connected', () => {
    console.log('✅ Twitch Client Connected');
    io.emit('twitch_status', { connected: true });
});

twitchClient.on('disconnected', () => {
    console.log('❌ Twitch Client Disconnected');
    io.emit('twitch_status', { connected: false });
});

twitchClient.connect().catch(console.error);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});