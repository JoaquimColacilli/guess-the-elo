function parseElo(message) {
    // Parse ELO: 100-3500
    const eloRegex = /\b([1-9][0-9]{2}|[1-2][0-9]{3}|3[0-4][0-9]{2}|3500)\b/;
    const match = message.match(eloRegex);
    return match ? parseInt(match[0], 10) : null;
}

function calculateStats(audienceGuesses) {
    if (!audienceGuesses || audienceGuesses.size === 0) return { total: 0, average: 0 };

    let sum = 0;
    for (const elo of audienceGuesses.values()) {
        sum += elo;
    }

    return {
        total: audienceGuesses.size,
        average: Math.round(sum / audienceGuesses.size)
    };
}

function calculateResults(gothamSubELO, streamerGuess, audienceGuesses) {
    const stats = calculateStats(audienceGuesses);
    const audienceAvg = stats.average;

    // Calculate Differences based on GOTHAM SUB ELO
    const targetELO = gothamSubELO;

    const streamerDiff = Math.abs(streamerGuess - targetELO);
    const audienceDiff = Math.abs(audienceAvg - targetELO);

    // Determine Winner
    let winner = 'DRAW';
    if (streamerDiff < audienceDiff) winner = 'STREAMER';
    else if (audienceDiff < streamerDiff) winner = 'AUDIENCE';

    // Find Exact Matches
    const exactMatches = [];
    const leaderboard = [];

    for (const [user, guess] of audienceGuesses.entries()) {
        const diff = Math.abs(guess - targetELO);
        const entry = { user, guess, diff };

        leaderboard.push(entry);
        if (diff === 0) exactMatches.push(user);
    }

    // Sort Leaderboard (Top 5 closest)
    leaderboard.sort((a, b) => a.diff - b.diff);

    return {
        gothamSubELO,
        streamerGuess,
        streamerDiff,
        audienceAvg,
        audienceDiff,
        winner,
        exactMatches,
        leaderboard: leaderboard.slice(0, 5)
    };
}

module.exports = {
    parseElo,
    calculateStats,
    calculateResults
};
