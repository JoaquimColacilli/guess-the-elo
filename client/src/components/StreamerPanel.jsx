import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';

export default function StreamerPanel({ isConnected, serverStatus, messages, stats, gameState, roundResult, notification }) {
    const [showRevealModal, setShowRevealModal] = useState(false);
    const [streamerGuessInput, setStreamerGuessInput] = useState('');
    const chatContainerRef = useRef(null);

    // gameState is now an object: { state, elosLocked, hasStreamerGuess }
    const currentState = gameState.state;

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Listen for reset to clear local state
    useEffect(() => {
        function onRoundReset() {
            console.log('Streamer: Round Reset received');
            setShowRevealModal(false);
            setStreamerGuessInput('');
        }

        socket.on('round_reset', onRoundReset);
        return () => {
            socket.off('round_reset', onRoundReset);
        };
    }, []);

    const handleStartRound = () => {
        socket.emit('start_round');
    };

    const handleOpenRevealModal = () => {
        setShowRevealModal(true);
    };

    const handleSubmitReveal = () => {
        if (!streamerGuessInput) return;
        socket.emit('reveal_round', parseInt(streamerGuessInput, 10));
        setShowRevealModal(false);
    };

    const handleReset = () => {
        socket.emit('reset_round');
        // Local state cleared via onRoundReset listener
    };

    return (
        <div className="min-h-screen bg-twitch-dark p-6 text-twitch-text font-sans relative">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-2xl border-l-4 animate-bounce-in ${notification.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' : 'bg-blue-900/90 border-blue-500 text-white'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{notification.type === 'success' ? '✅' : 'ℹ️'}</span>
                        <p className="font-bold">{notification.message}</p>
                    </div>
                </div>
            )}

            {/* REVEAL MODAL */}
            {showRevealModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-twitch-card border border-twitch-brand p-8 rounded-xl shadow-2xl max-w-md w-full animate-bounce-in">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Final Prediction</h2>
                        <p className="text-gray-400 mb-6 text-center">
                            Enter your ELO guess for the <strong className="text-twitch-brand">GothamChess Subscriber</strong>.
                        </p>

                        <input
                            type="number"
                            value={streamerGuessInput}
                            onChange={(e) => setStreamerGuessInput(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded p-4 text-3xl text-center font-bold text-white mb-6 focus:border-twitch-brand focus:outline-none"
                            placeholder="1200"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRevealModal(false)}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReveal}
                                disabled={!streamerGuessInput}
                                className="flex-1 py-3 bg-twitch-brand hover:bg-twitch-brand-dark text-white font-bold rounded disabled:opacity-50"
                            >
                                Confirm & Reveal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Header */}
                <div className="lg:col-span-3 bg-twitch-card border border-gray-800 rounded-xl p-6 flex justify-between items-center shadow-lg">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            Streamer Control Panel
                        </h1>
                        <p className="text-twitch-muted text-sm mt-1">Guess the ELO - Production Mode</p>
                    </div>
                    <div className="flex gap-4">
                        <StatusBadge label="Socket" status={isConnected} />
                        <StatusBadge label="Twitch" status={serverStatus.includes('Conectado')} />
                    </div>
                </div>

                {/* MAIN GAME FLOW AREA */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PHASE 1: WAITING FOR MODERATOR */}
                    {currentState === 'WAITING' && (
                        <div className="bg-twitch-card border border-gray-800 rounded-xl p-12 text-center shadow-lg flex flex-col items-center justify-center h-[400px]">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <span className="text-4xl">⏳</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Waiting for Moderator</h2>
                            <p className="text-twitch-muted max-w-md mx-auto">
                                The moderator needs to load the ELOs for both players before you can start.
                            </p>
                        </div>
                    )}

                    {/* PHASE 2: READY TO START */}
                    {currentState === 'READY' && (
                        <div className="bg-twitch-card border border-green-500/50 rounded-xl p-8 shadow-lg flex flex-col items-center justify-center h-[400px]">
                            <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">ELOs Loaded</h2>
                            <p className="text-green-400 mb-8">Ready to start the round for the audience.</p>

                            <button
                                onClick={handleStartRound}
                                className="px-12 py-6 bg-twitch-brand hover:bg-twitch-brand-dark text-white font-black text-2xl rounded-xl shadow-lg transform hover:scale-[1.02] transition-all"
                            >
                                START ROUND ▶
                            </button>
                        </div>
                    )}

                    {/* PHASE 3: GUESSING (ACTIVE) */}
                    {currentState === 'GUESSING' && (
                        <div className="bg-twitch-card border border-green-600 rounded-xl p-8 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl">📡</span>
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-green-400 uppercase tracking-widest animate-pulse">Round Active</h2>
                                    <p className="text-green-200/70">Chat is voting now...</p>
                                </div>
                                <div className="bg-black/40 px-6 py-3 rounded-lg border border-green-500/30">
                                    <span className="block text-xs text-green-500 uppercase font-bold">Total Votes</span>
                                    <span className="text-3xl font-black text-white">{stats.total}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <StatCard title="Current Average ELO" value={stats.average || '-'} />
                            </div>

                            <button
                                onClick={handleOpenRevealModal}
                                className="w-full py-6 bg-yellow-600 hover:bg-yellow-700 text-black font-black text-2xl rounded-xl shadow-lg transform hover:scale-[1.02] transition-all"
                            >
                                REVEAL ELO 🏆
                            </button>
                        </div>
                    )}

                    {/* PHASE 4: REVEALED (RESULTS) */}
                    {currentState === 'REVEALED' && roundResult && (
                        <div className="space-y-6">
                            {/* Main Winner Card */}
                            <div className="bg-twitch-card border border-yellow-500 rounded-xl p-8 shadow-2xl text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>

                                <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4">ACTUAL GAME ELO</h2>

                                <div className="bg-black/40 rounded-xl p-6 mb-8 border border-gray-700 inline-block min-w-[300px]">
                                    <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                                        <span className="text-twitch-brand font-bold">Gotham Sub</span>
                                        <span className="text-3xl font-black text-white">{roundResult.gothamSubELO}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">Random Player</span>
                                        <span className="text-xl font-bold text-gray-300">{roundResult.randomPlayerELO}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className={`p-4 rounded-xl border ${roundResult.winner === 'STREAMER' ? 'bg-green-900/40 border-green-500' : 'bg-black/40 border-gray-700'}`}>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Your Guess</h3>
                                        <div className="text-3xl font-bold text-white">{roundResult.streamerGuess}</div>
                                        <div className={`text-sm font-mono mt-1 ${roundResult.winner === 'STREAMER' ? 'text-green-400' : 'text-red-400'}`}>
                                            Diff: {roundResult.streamerDiff}
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${roundResult.winner === 'AUDIENCE' ? 'bg-green-900/40 border-green-500' : 'bg-black/40 border-gray-700'}`}>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Chat Average</h3>
                                        <div className="text-3xl font-bold text-white">{roundResult.audienceAvg}</div>
                                        <div className={`text-sm font-mono mt-1 ${roundResult.winner === 'AUDIENCE' ? 'text-green-400' : 'text-red-400'}`}>
                                            Diff: {roundResult.audienceDiff}
                                        </div>
                                    </div>
                                </div>

                                <div className="inline-block px-8 py-2 bg-yellow-500 text-black font-black text-xl rounded-full shadow-lg mb-6">
                                    WINNER: {roundResult.winner}
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="block w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Start New Round
                                </button>
                            </div>

                            {/* Leaderboard */}
                            <div className="bg-twitch-card border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>🏆</span> Chat Leaderboard (Closest to Gotham Sub)
                                </h3>
                                <div className="space-y-2">
                                    {roundResult.leaderboard.map((entry, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-black/40 p-3 rounded border border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400 text-lg' : 'text-gray-500'}`}>#{idx + 1}</span>
                                                <span className="font-bold text-white">{entry.user}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-twitch-muted text-sm">Guessed: <span className="text-white font-mono">{entry.guess}</span></span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${entry.diff === 0 ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                                                    Diff: {entry.diff}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Chat Feed (Standard Order: Newest Bottom) */}
                <div className="bg-twitch-card border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col h-[600px]">
                    <h2 className="text-lg font-bold mb-4 text-twitch-muted uppercase tracking-wider flex justify-between">
                        Live Feed
                        <span className="text-xs bg-twitch-surface px-2 py-1 rounded text-green-400">● Live</span>
                    </h2>

                    <div
                        ref={chatContainerRef}
                        className="flex-1 bg-black/40 rounded-lg border border-gray-800 p-4 overflow-y-auto font-mono text-sm scroll-smooth"
                    >
                        <div className="flex flex-col gap-3">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`animate-fade-in ${msg.isSystem ? 'bg-blue-900/20 border-l-2 border-blue-500 pl-2 py-1' : msg.isGuess ? 'bg-twitch-brand/10 border-l-2 border-twitch-brand pl-2' : ''}`}>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs text-gray-500">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                                        <span className={`font-bold ${msg.isSystem ? 'text-blue-400' : msg.isGuess ? 'text-twitch-accent' : 'text-twitch-brand'}`}>{msg.user}:</span>
                                    </div>
                                    <p className="text-gray-300 mt-1 pl-14 break-words">
                                        {msg.text}
                                        {msg.isGuess && <span className="ml-2 text-xs bg-twitch-brand text-white px-1 rounded">ELO: {msg.guessValue}</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatusBadge({ label, status }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status
            ? 'bg-green-900/20 border-green-900 text-green-400'
            : 'bg-red-900/20 border-red-900 text-red-400'
            }`}>
            <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="bg-twitch-card border border-gray-800 rounded-xl p-6">
            <h3 className="text-twitch-muted text-xs uppercase font-bold mb-2">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
