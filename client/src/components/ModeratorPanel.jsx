import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';

const ModeratorPanel = () => {
    const { user, logout } = useAuth();
    const [gothamSub, setGothamSub] = useState('');
    const [randomPlayer, setRandomPlayer] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        document.title = "GTE - Moderator Panel";
    }, []);

    useEffect(() => {
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('notification', (data) => {
            setStatus({ type: data.type, message: data.message });
            // Auto clear success messages
            if (data.type === 'success') {
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('notification');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const subElo = parseInt(gothamSub);
        const randomElo = parseInt(randomPlayer);

        if (!subElo || !randomElo) {
            setStatus({ type: 'error', message: 'Both ELOs are required.' });
            return;
        }

        if (subElo < 100 || subElo > 3500 || randomElo < 100 || randomElo > 3500) {
            setStatus({ type: 'error', message: 'ELOs must be between 100 and 3500.' });
            return;
        }

        socket.emit('admin_set_elos', { gothamSub, randomPlayer });
        // Clear inputs after successful send (optional, maybe keep them for reference?)
        // setGothamSub('');
        // setRandomPlayer('');
    };

    return (
        <div className="min-h-screen bg-[#0e0e10] text-white font-sans flex flex-col">
            {/* --- HEADER --- */}
            <header className="bg-[#18181b] border-b border-gray-800 p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-[#9146FF]">♜ Moderator Panel</h1>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Status */}
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${isConnected ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                    </div>

                    {/* User Section */}
                    <div className="flex items-center space-x-4 pl-6 border-l border-gray-700">
                        <div className="text-right hidden sm:block">
                            <div className="font-bold text-white">{user?.display_name || 'Moderator'}</div>
                            <div className="text-xs text-gray-400 uppercase">MODERATOR</div>
                        </div>
                        <img
                            src={user?.profile_image_url || "https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-70x70.png"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-600"
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
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl bg-[#18181b] rounded-2xl border border-gray-800 shadow-2xl p-8 space-y-8">

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white">Load Match Data</h2>
                        <p className="text-gray-400">Enter the ELO ratings for the current match.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Input 1 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                                    Gotham Subscriber ELO
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={gothamSub}
                                        onChange={(e) => setGothamSub(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:border-[#9146FF] focus:ring-1 focus:ring-[#9146FF] focus:outline-none transition-all font-mono"
                                        placeholder="e.g. 1200"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                        ♔
                                    </div>
                                </div>
                            </div>

                            {/* Input 2 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                                    Random Player ELO
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={randomPlayer}
                                        onChange={(e) => setRandomPlayer(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:border-[#9146FF] focus:ring-1 focus:ring-[#9146FF] focus:outline-none transition-all font-mono"
                                        placeholder="e.g. 1350"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                        ♟
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <div className={`p-4 rounded-lg text-center font-bold animate-fade-in ${status.type === 'error' ? 'bg-red-900/20 text-red-400 border border-red-900' : 'bg-green-900/20 text-green-400 border border-green-900'
                                }`}>
                                {status.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#9146FF] hover:bg-[#772ce8] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-[#9146FF]/20 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                        >
                            <span>✓ LOAD ELOs TO SYSTEM</span>
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ModeratorPanel;
