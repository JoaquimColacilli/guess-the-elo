import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { socket } from './services/socket';
import StreamerPanel from './components/StreamerPanel';
import OBSOverlay from './components/OBSOverlay';
import ModeratorPanel from './components/ModeratorPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [serverStatus, setServerStatus] = useState('Desconocido');
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });

  // New Global State
  const [gameState, setGameState] = useState({
    state: 'WAITING', // WAITING, READY, GUESSING, REVEALED
    hasRealElo: false,
    hasStreamerGuess: false
  });

  const [roundResult, setRoundResult] = useState(null);
  const [notification, setNotification] = useState(null); // { type, message }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onServerStatus(data) {
      setServerStatus(data.twitchConnected ? 'Conectado a Twitch' : 'Esperando a Twitch');
    }

    function onChatMessage(data) {
      setMessages(prev => {
        const newMessages = [...prev, data];
        return newMessages.slice(-50); // Keep last 50 messages
      });
    }

    function onGameStats(data) {
      setStats(data);
    }

    function onGameState(data) {
      setGameState(data);
    }

    function onRoundResult(result) {
      setRoundResult(result);
    }

    function onNotification(note) {
      setNotification(note);
      // Auto clear after 5s
      setTimeout(() => setNotification(null), 5000);
    }

    // Sync Events
    function onElosLoaded(data) {
      // Optional: Can trigger specific UI effects if needed
      console.log('ELOs Loaded:', data);
    }

    function onRoundReset() {
      console.log('Round Reset');
      setRoundResult(null);
      setStats({ total: 0, average: 0 });
      // gameState is updated via onGameState separately
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('server_status', onServerStatus);
    socket.on('chat_message', onChatMessage);
    socket.on('game_stats', onGameStats);
    socket.on('game_state', onGameState);
    socket.on('round_result', onRoundResult);
    socket.on('notification', onNotification);

    socket.on('elos_loaded', onElosLoaded);
    socket.on('round_reset', onRoundReset);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('server_status', onServerStatus);
      socket.off('chat_message', onChatMessage);
      socket.off('game_stats', onGameStats);
      socket.off('game_state', onGameState);
      socket.off('round_result', onRoundResult);
      socket.off('notification', onNotification);

      socket.off('elos_loaded', onElosLoaded);
      socket.off('round_reset', onRoundReset);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/streamer"
        element={
          <ProtectedRoute requiredRole="broadcaster">
            <StreamerPanel
              isConnected={isConnected}
              serverStatus={serverStatus}
              messages={messages}
              stats={stats}
              gameState={gameState}
              roundResult={roundResult}
              notification={notification}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/moderator"
        element={
          <ProtectedRoute requiredRole="moderator">
            <ModeratorPanel isConnected={isConnected} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/obs"
        element={
          <OBSOverlay
            messages={messages}
            stats={stats}
            gameState={gameState.state}
            roundResult={roundResult}
          />
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;