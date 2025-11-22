import { describe, it, expect } from 'vitest';
import { calculateStats, calculateResults } from '../../src/utils/gameLogic';

describe('Stats Calculation', () => {
    it('should calculate correct average from guesses', () => {
        const guesses = new Map();
        guesses.set('user1', 1000);
        guesses.set('user2', 2000);

        const stats = calculateStats(guesses);
        expect(stats.total).toBe(2);
        expect(stats.average).toBe(1500);
    });

    it('should handle empty guesses', () => {
        const guesses = new Map();
        const stats = calculateStats(guesses);
        expect(stats.total).toBe(0);
        expect(stats.average).toBe(0);
    });
});

describe('Results Calculation', () => {
    it('should determine winner correctly (Streamer wins)', () => {
        const guesses = new Map();
        guesses.set('user1', 1000); // Avg 1000

        // Target: 1200
        // Streamer: 1150 (Diff 50)
        // Audience: 1000 (Diff 200)

        const results = calculateResults(1200, 1150, guesses);
        expect(results.winner).toBe('STREAMER');
        expect(results.streamerDiff).toBe(50);
        expect(results.audienceDiff).toBe(200);
    });

    it('should determine winner correctly (Audience wins)', () => {
        const guesses = new Map();
        guesses.set('user1', 1200); // Avg 1200

        // Target: 1200
        // Streamer: 1000 (Diff 200)
        // Audience: 1200 (Diff 0)

        const results = calculateResults(1200, 1000, guesses);
        expect(results.winner).toBe('AUDIENCE');
    });

    it('should identify exact matches', () => {
        const guesses = new Map();
        guesses.set('winner', 1200);
        guesses.set('loser', 1000);

        const results = calculateResults(1200, 1000, guesses);
        expect(results.exactMatches).toContain('winner');
        expect(results.exactMatches).not.toContain('loser');
    });
});
