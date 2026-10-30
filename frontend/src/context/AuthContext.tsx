import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, UNAUTHORIZED_EVENT } from "../lib/api";
import type { AuthUser } from "../types";

interface LoginUser {
    id?: string;
    name: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user?: LoginUser) => void;
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
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<AuthUser | null>(() => {
        const cached = localStorage.getItem("user_name");
        return cached ? { id: "", name: cached } : null;
    });
    const [loading, setLoading] = useState(true);

    const clearSession = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_name");
        setToken(null);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get<{ user: AuthUser }>("/api/v1/user/me");
            if (response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem("user_name", response.data.user.name);
            }
        } catch {
            // The API interceptor handles 401s. For network errors, keep the cached
            // name so the UI still renders rather than flashing a signed-out state.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        const handleUnauthorized = () => {
            clearSession();
        };

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    }, [clearSession]);

    const login = useCallback(
        (newToken: string, newUser?: LoginUser) => {
            localStorage.setItem("token", newToken);
            if (newUser?.name) {
                localStorage.setItem("user_name", newUser.name);
                setUser({ id: newUser.id ?? "", name: newUser.name });
            }
            setToken(newToken);
            void refreshUser();
        },
        [refreshUser]
    );

    const logout = useCallback(() => {
        clearSession();
        setLoading(false);
    }, [clearSession]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
