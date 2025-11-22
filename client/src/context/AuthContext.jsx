import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await axios.get('http://localhost:3001/auth/me', {
                withCredentials: true // Important for cookies
            });
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        window.location.href = 'http://localhost:3001/auth/twitch';
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3001/auth/logout', {}, {
                withCredentials: true
            });
            setUser(null);
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
