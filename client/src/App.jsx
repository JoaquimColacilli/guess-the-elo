import { useState, useEffect } from 'react';
import { socket } from './services/socket';
import StreamerPanel from './components/StreamerPanel';
import OBSOverlay from './components/OBSOverlay';
import ModeratorPanel from './components/ModeratorPanel';

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

  const [viewMode, setViewMode] = useState('streamer'); // 'streamer' | 'obs' | 'moderator'

  useEffect(() => {
    // Simple URL param routing
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (params.get('view') === 'obs') {
      setViewMode('obs');
      document.body.style.backgroundColor = 'transparent';
    } else if (path === '/moderator') {
      setViewMode('moderator');
    }

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

  if (viewMode === 'obs') {
    return <OBSOverlay messages={messages} stats={stats} gameState={gameState.state} roundResult={roundResult} />;
  }

  if (viewMode === 'moderator') {
    return <ModeratorPanel isConnected={isConnected} />;
  }

  return (
    <StreamerPanel
      isConnected={isConnected}
      serverStatus={serverStatus}
      messages={messages}
      stats={stats}
      gameState={gameState}
      roundResult={roundResult}
      notification={notification}
    />
  );
}

export default App;