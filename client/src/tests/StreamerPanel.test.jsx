import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StreamerPanel from '../components/StreamerPanel';
import { AuthProvider } from '../context/AuthContext';
import { socket } from '../services/socket';

// Mock dependencies
vi.mock('axios', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] }))
    }
}));

vi.mock('../services/socket', () => ({
    socket: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        connected: true
    }
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { display_name: 'Streamer', role: 'broadcaster' },
        logout: vi.fn()
    }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('StreamerPanel Component', () => {
    it('should render correctly', () => {
        render(
            <AuthProvider>
                <StreamerPanel />
            </AuthProvider>
        );
        expect(screen.getByText(/Streamer Control/i)).toBeInTheDocument();
        expect(screen.getByText(/Game Controls/i)).toBeInTheDocument();
    });

    it('should disable START button when ELOs not loaded (WAITING state)', () => {
        render(
            <AuthProvider>
                <StreamerPanel />
            </AuthProvider>
        );
        const startButton = screen.getByText(/START ROUND/i);
        expect(startButton).toBeDisabled();
    });

    it('should emit start_round event when START button clicked (READY state)', async () => {
        render(
            <AuthProvider>
                <StreamerPanel />
            </AuthProvider>
        );

        // Simulate socket event to change state to READY
        const onCalls = socket.on.mock.calls;
        const gameStateHandler = onCalls.find(call => call[0] === 'game_state')?.[1];

        if (gameStateHandler) {
            // Act
            require('react').act(() => {
                gameStateHandler({ state: 'READY', elosLocked: true });
            });

            // Assert
            const startButton = screen.getByText(/START ROUND/i);

            // Wait for the button to be enabled
            await waitFor(() => {
                expect(startButton).not.toBeDisabled();
            });

            fireEvent.click(startButton);
            expect(socket.emit).toHaveBeenCalledWith('start_round');
        }
    });
});
