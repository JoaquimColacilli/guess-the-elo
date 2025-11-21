import { useState, useEffect } from 'react';

export default function OBSOverlay({ messages, stats, gameState, roundResult }) {
    const lastMessage = messages[messages.length - 1];

    // Simulación de eventos para demo visual
    useEffect(() => {
        if (lastMessage) {
            // Animación simple de entrada
            const el = document.getElementById('chat-bubble');
            if (el) {
                el.classList.remove('animate-bounce-in');
                void el.offsetWidth; // trigger reflow
                el.classList.add('animate-bounce-in');
            }
        }
    }, [lastMessage]);

    return (
        <div className="min-h-screen bg-transparent p-8 flex flex-col justify-end items-start font-sans overflow-hidden">

            {/* Main Game Overlay Container */}
            <div className="w-[400px] space-y-4">

                {/* Status Bar */}
                <div className="bg-twitch-card/90 backdrop-blur-md border-l-4 border-twitch-brand p-4 rounded-r-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
                    <h2 className="text-twitch-accent font-bold uppercase tracking-widest text-sm mb-1">Guess the ELO</h2>
                    <div className="flex justify-between items-end">
                        <span className="text-white text-2xl font-black">
                            {gameState === 'GUESSING' ? 'GUESSING...' :
                                gameState === 'REVEALED' ? 'WINNERS!' :
                                    gameState === 'WAITING' ? 'WAITING...' :
                                        'READY'}
                        </span>
                        <span className="text-twitch-muted text-xs font-mono">!guess [elo]</span>
                    </div>
                </div>

                {/* WINNERS DISPLAY (Only when REVEALED) */}
                {gameState === 'REVEALED' && roundResult && (
                    <div className="bg-twitch-card/95 backdrop-blur border border-yellow-500 p-4 rounded-xl shadow-2xl animate-fade-in">
                        <div className="mb-3 border-b border-gray-700 pb-2">
                            <span className="text-yellow-400 font-bold uppercase text-xs block mb-1">Actual Game ELO</span>
                            <div className="flex justify-between items-center">
                                <span className="text-twitch-brand font-bold text-sm">Gotham Sub</span>
                                <span className="text-2xl font-black text-white">{roundResult.gothamSubELO}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-400 font-bold text-sm">Random Player</span>
                                <span className="text-lg font-bold text-gray-300">{roundResult.randomPlayerELO}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4 bg-black/40 p-2 rounded">
                            <span className="text-xs text-gray-400 uppercase font-bold">Winner</span>
                            <span className="text-lg font-black text-green-400">{roundResult.winner}</span>
                        </div>

                        <div className="space-y-2">
                            {roundResult.leaderboard.slice(0, 3).map((winner, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500 font-bold">#{idx + 1}</span>
                                        <span className="text-white font-bold">{winner.user}</span>
                                    </div>
                                    <span className="text-gray-400 font-mono">{winner.guess}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Interaction Bubble (Dynamic) */}
                {gameState !== 'REVEALED' && lastMessage && (
                    <div id="chat-bubble" className="animate-bounce-in origin-bottom-left">
                        <div className="bg-twitch-surface/90 backdrop-blur border border-gray-700 p-3 rounded-xl rounded-bl-none inline-block max-w-full shadow-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-twitch-brand text-sm">{lastMessage.user}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Just now</span>
                            </div>
                            <p className="text-white text-sm leading-tight">{lastMessage.text}</p>
                            {lastMessage.isGuess && (
                                <span className="mt-1 inline-block text-[10px] bg-twitch-brand text-white px-1.5 py-0.5 rounded font-bold">
                                    Guess: {lastMessage.guessValue}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Mini Bar */}
                <div className="flex gap-2">
                    <div className="bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white border border-gray-800">
                        <span className="text-twitch-muted mr-2">AVG:</span>
                        {stats.average || '-'}
                    </div>
                    <div className="bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white border border-gray-800">
                        <span className="text-twitch-muted mr-2">VOTES:</span>
                        {stats.total}
                    </div>
                </div>

            </div>
        </div>
    );
}
