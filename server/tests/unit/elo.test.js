import { describe, it, expect } from 'vitest';
import { parseElo } from '../../src/utils/gameLogic';

describe('ELO Parser', () => {
    it('should extract valid ELO from message "I think 1200"', () => {
        expect(parseElo('I think 1200')).toBe(1200);
    });

    it('should ignore ELO outside range (50, 4000)', () => {
        expect(parseElo('My elo is 5000')).toBeNull();
        expect(parseElo('elo is 10')).toBeNull();
    });

    it('should handle multiple numbers and take first valid one', () => {
        expect(parseElo('1200 and 1500')).toBe(1200);
    });

    it('should return null for no numbers', () => {
        expect(parseElo('hello world')).toBeNull();
    });

    it('should handle edge cases', () => {
        expect(parseElo('100')).toBe(100);
        expect(parseElo('3500')).toBe(3500);
        expect(parseElo('3501')).toBeNull();
        expect(parseElo('99')).toBeNull();
    });
});
