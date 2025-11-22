import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const { user, login } = useAuth();

    useEffect(() => {
        document.title = "GTE - Login";
    }, []);

    if (user) {
        if (user.role === 'broadcaster') return <Navigate to="/streamer" replace />;
        if (user.role === 'moderator') return <Navigate to="/moderator" replace />;
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-10 left-10 text-9xl">♔</div>
                <div className="absolute bottom-10 right-10 text-9xl">♜</div>
                <div className="absolute top-1/2 left-1/4 text-8xl">♗</div>
            </div>

            <div className="z-10 max-w-4xl w-full flex flex-col items-center space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-6xl font-bold tracking-tighter text-[#9146FF] drop-shadow-lg">
                        GUESS THE ELO
                    </h1>
                    <p className="text-2xl text-gray-300 font-light tracking-wide">
                        for <span className="font-semibold text-white">GothamChess</span> Stream
                    </p>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Track chess ELO predictions in real-time, compete with chat, and see who guesses best.
                    </p>
                </div>

                {/* Login Action */}
                <div className="bg-[#18181b] p-8 rounded-2xl shadow-2xl border border-[#9146FF]/20 w-full max-w-md flex flex-col items-center space-y-6 transform hover:scale-105 transition-transform duration-300">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold">Welcome Back</h2>
                        <p className="text-sm text-gray-400">Sign in to access the control panel</p>
                    </div>

                    <button
                        onClick={login}
                        className="w-full bg-[#9146FF] hover:bg-[#772ce8] text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-[#9146FF]/40"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                        </svg>
                        <span className="text-lg">Login with Twitch</span>
                    </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <FeatureCard
                        icon="📊"
                        title="Real-time Stats"
                        desc="Live tracking of chat guesses and averages."
                    />
                    <FeatureCard
                        icon="🏆"
                        title="Leaderboards"
                        desc="See who predicts the ELO most accurately."
                    />
                    <FeatureCard
                        icon="🤖"
                        title="Auto-Detect"
                        desc="Seamless integration with Twitch Chat."
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-gray-600 text-sm">
                Guess The ELO v1.0 • Powered by Twitch API
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-[#18181b]/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-[#9146FF]/50 transition-colors text-center space-y-3">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{desc}</p>
    </div>
);

export default Login;
