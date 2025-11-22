import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModeratorPanel from '../components/ModeratorPanel';
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
        user: { display_name: 'Moderator', role: 'moderator' },
        logout: vi.fn()
    }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('ModeratorPanel Component', () => {
    it('should render correctly', () => {
        render(
            <AuthProvider>
                <ModeratorPanel />
            </AuthProvider>
        );
        expect(screen.getByText(/Moderator Panel/i)).toBeInTheDocument();
        expect(screen.getByText(/Match Setup/i)).toBeInTheDocument();
    });

    it('should allow entering ELOs', () => {
        render(
            <AuthProvider>
                <ModeratorPanel />
            </AuthProvider>
        );

        const subInput = screen.getByPlaceholderText(/Gotham Sub ELO/i);
        const randomInput = screen.getByPlaceholderText(/Random Player ELO/i);

        fireEvent.change(subInput, { target: { value: '1200' } });
        fireEvent.change(randomInput, { target: { value: '1300' } });

        expect(subInput.value).toBe('1200');
        expect(randomInput.value).toBe('1300');
    });

    it('should emit admin_set_elos when SET MATCH button clicked', () => {
        render(
            <AuthProvider>
                <ModeratorPanel />
            </AuthProvider>
        );

        const subInput = screen.getByPlaceholderText(/Gotham Sub ELO/i);
        const randomInput = screen.getByPlaceholderText(/Random Player ELO/i);
        const setButton = screen.getByText(/SET MATCH/i);

        fireEvent.change(subInput, { target: { value: '1200' } });
        fireEvent.change(randomInput, { target: { value: '1300' } });
        fireEvent.click(setButton);

        expect(socket.emit).toHaveBeenCalledWith('admin_set_elos', {
            gothamSub: '1200',
            randomPlayer: '1300'
        });
    });
});
