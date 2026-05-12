import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
}

interface AuthContextValue extends AuthState {
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    updateUser: (partial: Partial<AuthUser>) => void;
    isAuthenticated: boolean;
}

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

function loadFromStorage(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { token, user };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(loadFromStorage);

    function login(token: string, user: AuthUser) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({ token, user });
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({ token: null, user: null });
    }

    function updateUser(partial: Partial<AuthUser>) {
        setState((prev) => {
            if (!prev.user) return prev;
            const updated = { ...prev.user, ...partial };
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
            return { ...prev, user: updated };
        });
    }

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser, isAuthenticated: !!state.token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return ctx;
}
