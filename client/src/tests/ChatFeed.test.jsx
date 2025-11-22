import { render, screen } from '@testing-library/react';
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

describe('Chat Feed Logic', () => {
    it('should display messages in correct order (oldest to newest)', () => {
        render(
            <AuthProvider>
                <StreamerPanel />
            </AuthProvider>
        );

        const onCalls = socket.on.mock.calls;
        const chatHandler = onCalls.find(call => call[0] === 'chat_message')?.[1];

        if (chatHandler) {
            require('react').act(() => {
                chatHandler({ user: 'user1', text: 'First', timestamp: '1' });
                chatHandler({ user: 'user2', text: 'Second', timestamp: '2' });
            });

            // Check if they appear in the document
            expect(screen.getByText('First')).toBeInTheDocument();
            expect(screen.getByText('Second')).toBeInTheDocument();

            // Check order: First should be above Second
            // We check the entire text content of the chat container
            const chatContainer = screen.getByText('Live Chat Feed').closest('div').parentElement;
            const content = chatContainer.textContent;
            const firstIndex = content.indexOf('First');
            const secondIndex = content.indexOf('Second');

            expect(firstIndex).toBeGreaterThan(-1);
            expect(secondIndex).toBeGreaterThan(-1);
            expect(firstIndex).toBeLessThan(secondIndex);
        }
    });
});
