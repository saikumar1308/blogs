import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

interface User {
    id: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, name?: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: () => {},
    logout: () => {},
    refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const cached = localStorage.getItem('user_name');
        return cached ? { id: '', name: cached } : null;
    });
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                headers: { Authorization: currentToken }
            });
            if (res.data?.user) {
                setUser(res.data.user);
                localStorage.setItem('user_name', res.data.user.name);
            }
        } catch {
            // If token invalid, keep cached or clear gracefully
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = (newToken: string, name?: string) => {
        localStorage.setItem('token', newToken);
        if (name) {
            localStorage.setItem('user_name', name);
            setUser({ id: '', name });
        }
        setToken(newToken);
        refreshUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_name');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
