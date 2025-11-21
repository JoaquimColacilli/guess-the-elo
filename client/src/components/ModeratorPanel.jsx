import { useState, useEffect } from 'react';
import { socket } from '../services/socket';

export default function ModeratorPanel({ isConnected }) {
    const [gothamSubInput, setGothamSubInput] = useState('');
    const [randomPlayerInput, setRandomPlayerInput] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        function onRoundReset() {
            console.log('Moderator: Round Reset received');
            setSubmitted(false);
            setGothamSubInput('');
            setRandomPlayerInput('');
        }

        // Also listen to initial state to determine if locked
        function onGameState(data) {
            if (data.elosLocked) {
                setSubmitted(true);
            } else if (data.state === 'WAITING') {
                setSubmitted(false);
            }
        }

        socket.on('round_reset', onRoundReset);
        socket.on('game_state', onGameState);

        return () => {
            socket.off('round_reset', onRoundReset);
            socket.off('game_state', onGameState);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!gothamSubInput || !randomPlayerInput) return;

        const gothamSub = parseInt(gothamSubInput, 10);
        const randomPlayer = parseInt(randomPlayerInput, 10);

        if (isNaN(gothamSub) || isNaN(randomPlayer)) return;

        socket.emit('admin_set_elos', { gothamSub, randomPlayer });
        setSubmitted(true);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset the round? This will clear all data.')) {
            socket.emit('reset_round');
            // State update will happen via socket event 'round_reset'
        }
    };

    return (
        <div className="min-h-screen bg-twitch-dark flex items-center justify-center p-6 font-sans">
            <div className="bg-twitch-card border border-twitch-brand p-8 rounded-xl shadow-2xl max-w-md w-full relative">

                {/* Connection Status */}
                <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Moderator Panel</h1>
                <p className="text-twitch-muted mb-6 text-sm">
                    Load the ELO ratings for the upcoming match.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Input 1: Gotham Sub */}
                    <div>
                        <label className="block text-xs font-bold text-twitch-brand uppercase mb-2">
                            GothamChess Subscriber ELO
                        </label>
                        <input
                            type="number"
                            value={gothamSubInput}
                            onChange={(e) => setGothamSubInput(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded p-4 text-2xl text-center font-bold text-white focus:outline-none focus:border-twitch-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="e.g. 1200"
                            disabled={submitted}
                            autoFocus
                        />
                    </div>

                    {/* Input 2: Random Player */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                            Random Player ELO
                        </label>
                        <input
                            type="number"
                            value={randomPlayerInput}
                            onChange={(e) => setRandomPlayerInput(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded p-4 text-2xl text-center font-bold text-white focus:outline-none focus:border-twitch-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="e.g. 1350"
                            disabled={submitted}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${submitted
                                ? 'bg-green-600 text-white cursor-default'
                                : 'bg-twitch-brand hover:bg-twitch-brand-dark text-white shadow-lg hover:shadow-twitch-brand/20'
                            }`}
                        disabled={submitted || !gothamSubInput || !randomPlayerInput}
                    >
                        {submitted ? '✅ ELOs Locked' : 'Load ELOs to System'}
                    </button>
                </form>

                {submitted && (
                    <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                        <p className="text-xs text-green-400 mb-4">
                            Round is active. Controls are locked until reset.
                        </p>
                        <button
                            onClick={handleReset}
                            className="text-red-500 hover:text-red-400 text-sm font-bold underline"
                        >
                            Reset Round (Emergency)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
