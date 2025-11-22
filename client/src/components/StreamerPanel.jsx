import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
import axios from 'axios';

const StreamerPanel = () => {
    const { user, logout } = useAuth();
    const [gameState, setGameState] = useState({ state: 'WAITING', elosLocked: false, hasStreamerGuess: false });
    const [stats, setStats] = useState({ total: 0, average: 0 });
    const [results, setResults] = useState(null);
    const [guessInput, setGuessInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [moderators, setModerators] = useState([]);
    const chatEndRef = React.useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Status Indicators
    const [socketStatus, setSocketStatus] = useState('connecting');
    const [twitchStatus, setTwitchStatus] = useState('connecting');

    useEffect(() => {
        document.title = "GTE - Streamer Panel";
    }, []);

    useEffect(() => {
        // --- SOCKET EVENT LISTENERS ---

        // Connection Status
        socket.on('connect', () => setSocketStatus('connected'));
        socket.on('disconnect', () => setSocketStatus('disconnected'));

        socket.on('twitch_status', (status) => {
            setTwitchStatus(status.connected ? 'connected' : 'disconnected');
        });

        // Game Events
        socket.on('game_state', (data) => setGameState(data));
        socket.on('game_stats', (data) => setStats(data));
        socket.on('round_result', (data) => setResults(data));

        socket.on('chat_message', (msg) => {
            setChatMessages((prev) => [...prev, msg].slice(-50)); // Append and keep last 50
        });

        socket.on('notification', (data) => {
            // Optional: Add toast notification here
            console.log('Notification:', data.message);
        });

        // Initial Status Check (in case we missed the event)
        if (socket.connected) setSocketStatus('connected');

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('twitch_status');
            socket.off('game_state');
            socket.off('game_stats');
            socket.off('round_result');
            socket.off('chat_message');
            socket.off('notification');
        };
    }, []);

    // Fetch Moderators
    useEffect(() => {
        const fetchModerators = async () => {
            try {
                const res = await axios.get('http://localhost:3001/auth/moderators', { withCredentials: true });
                if (res.data.moderators) {
                    setModerators(res.data.moderators);
                }
            } catch (err) {
                console.error('Failed to fetch moderators', err);
            }
        };
        if (user?.role === 'broadcaster') {
            fetchModerators();
        }
    }, [user]);

    // --- ACTIONS ---

    const startRound = () => {
        socket.emit('start_round');
    };

    const revealRound = () => {
        if (!guessInput) return;
        socket.emit('reveal_round', guessInput);
    };

    const resetRound = () => {
        socket.emit('reset_round');
        setGuessInput('');
        setResults(null);
    };

    return (
        <div className="min-h-screen bg-[#0e0e10] text-white font-sans">
            {/* --- HEADER --- */}
            <header className="bg-[#18181b] border-b border-gray-800 p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-[#9146FF]">♔ Streamer Control</h1>
                    <span className="text-gray-500 text-sm hidden md:inline">Guess the ELO - Production</span>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Status Indicators */}
                    <div className="flex space-x-4 text-xs font-mono">
                        <StatusIndicator label="SOCKET" status={socketStatus} />
                        <StatusIndicator label="TWITCH" status={twitchStatus} />
                    </div>

                    {/* User Section */}
                    <div className="flex items-center space-x-4 pl-6 border-l border-gray-700">
                        <div className="text-right hidden sm:block">
                            <div className="font-bold text-white">{user?.display_name || 'Streamer'}</div>
                            <div className="text-xs text-[#9146FF] uppercase">{user?.role}</div>
                        </div>
                        <img
                            src={user?.profile_image_url || "https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-70x70.png"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-[#9146FF]"
                        />
                        <button
                            onClick={logout}
                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-colors"
                            title="Logout"
                        >
                            🚪
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="p-6 max-w-7xl mx-auto space-y-6">

                {/* Moderators Bar */}
                {user?.role === 'broadcaster' && (
                    <div className="bg-[#18181b] p-3 rounded-lg border border-gray-800 flex items-center space-x-3 overflow-x-auto">
                        <span className="text-gray-400 text-sm font-semibold whitespace-nowrap">📋 Active Moderators:</span>
                        {moderators.length > 0 ? (
                            moderators.map((mod) => (
                                <span key={mod.user_id} className="bg-[#9146FF]/20 text-[#9146FF] px-2 py-1 rounded text-xs border border-[#9146FF]/30">
                                    {mod.user_name}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-600 text-xs italic">No moderators found or API unavailable</span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: CONTROLS */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Game Control Card */}
                        <div className="bg-[#18181b] rounded-xl p-6 border border-gray-800 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Game Controls</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${gameState.state === 'GUESSING' ? 'bg-green-500/20 text-green-400 animate-pulse' :
                                    gameState.state === 'WAITING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'
                                    }`}>
                                    STATUS: {gameState.state}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Step 1: Wait for Mods */}
                                <div className={`p-4 rounded-lg border ${gameState.state === 'WAITING' ? 'bg-[#9146FF]/10 border-[#9146FF]' : 'bg-gray-900/50 border-gray-800 opacity-50'}`}>
                                    <h3 className="font-bold text-gray-300 mb-2">1. Match Setup</h3>
                                    <p className="text-sm text-gray-500">
                                        {gameState.elosLocked ? '✅ ELOs Loaded by Moderator' : '⏳ Waiting for Moderator to load ELOs...'}
                                    </p>
                                </div>

                                {/* Step 2: Start Round */}
                                <button
                                    onClick={startRound}
                                    disabled={gameState.state !== 'READY'}
                                    className={`p-4 rounded-lg border font-bold text-lg transition-all ${gameState.state === 'READY'
                                        ? 'bg-green-600 hover:bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                        : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    ▶ START ROUND
                                </button>
                            </div>

                            {/* Step 3: Reveal & Guess */}
                            {gameState.state === 'GUESSING' && (
                                <div className="mt-6 p-6 bg-gray-900/80 rounded-xl border border-gray-700 animate-fade-in">
                                    <h3 className="text-center text-lg font-bold mb-4 text-[#9146FF]">Enter Your Prediction to Reveal</h3>
                                    <div className="flex space-x-4">
                                        <input
                                            type="number"
                                            value={guessInput}
                                            onChange={(e) => setGuessInput(e.target.value)}
                                            placeholder="Your ELO Guess..."
                                            className="flex-1 bg-black border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-[#9146FF] focus:outline-none text-lg"
                                        />
                                        <button
                                            onClick={revealRound}
                                            className="bg-[#9146FF] hover:bg-[#772ce8] text-white font-bold px-8 py-3 rounded-lg shadow-lg"
                                        >
                                            REVEAL 🏆
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reset Button */}
                            {gameState.state === 'REVEALED' && (
                                <button
                                    onClick={resetRound}
                                    className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg border border-gray-600 transition-colors"
                                >
                                    🔄 RESET ROUND
                                </button>
                            )}
                        </div>

                        {/* Results Card */}
                        {results && (
                            <div className="bg-[#18181b] rounded-xl p-6 border border-gray-800 shadow-lg animate-slide-up">
                                <h2 className="text-2xl font-bold text-center mb-6 text-white">🏆 Round Results</h2>

                                <div className="grid grid-cols-3 gap-4 text-center mb-8">
                                    <ResultBox label="Gotham Sub ELO" value={results.gothamSubELO} color="text-yellow-400" />
                                    <ResultBox label="Your Guess" value={results.streamerGuess} color="text-[#9146FF]" />
                                    <ResultBox label="Chat Average" value={results.audienceAvg} color="text-cyan-400" />
                                </div>

                                <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700 mb-6">
                                    <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">WINNER</span>
                                    <div className={`text-4xl font-black mt-2 ${results.winner === 'STREAMER' ? 'text-[#9146FF]' :
                                        results.winner === 'AUDIENCE' ? 'text-cyan-400' : 'text-gray-400'
                                        }`}>
                                        {results.winner}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: STATS & CHAT */}
                    <div className="space-y-6">
                        {/* Live Stats */}
                        <div className="bg-[#18181b] rounded-xl p-6 border border-gray-800 shadow-lg">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Live Stats</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-4xl font-mono font-bold text-white">{stats.total}</div>
                                    <div className="text-xs text-gray-500">Total Guesses</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-mono font-bold text-cyan-400">{stats.average}</div>
                                    <div className="text-xs text-gray-500">Average ELO</div>
                                </div>
                            </div>
                        </div>




                        {/* Chat Feed */}
                        <div className="bg-[#18181b] rounded-xl border border-gray-800 shadow-lg flex flex-col h-[400px]">
                            <div className="p-4 border-b border-gray-800 bg-gray-900/50 rounded-t-xl">
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Live Chat Feed</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar flex flex-col">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`text-sm ${msg.isSystem ? 'text-yellow-400 font-bold text-center my-2' : 'text-gray-300'}`}>
                                        {!msg.isSystem && (
                                            <>
                                                <span className="font-bold text-[#9146FF]">{msg.user}: </span>
                                                <span className={msg.isGuess ? 'text-cyan-400 font-mono' : ''}>{msg.text}</span>
                                            </>
                                        )}
                                        {msg.isSystem && <span>{msg.text}</span>}
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Helper Components
const StatusIndicator = ({ label, status }) => {
    let colorClass = 'bg-red-500';
    if (status === 'connected') colorClass = 'bg-green-500';
    if (status === 'connecting') colorClass = 'bg-yellow-500';

    return (
        <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${colorClass} shadow-[0_0_8px_currentColor]`}></div>
            <span className={`font-bold ${status === 'connected' ? 'text-green-400' : status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`}>
                {label}
            </span>
        </div>
    );
};

const ResultBox = ({ label, value, color }) => (
    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
    </div>
);

export default StreamerPanel;
