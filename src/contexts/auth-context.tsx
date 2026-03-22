import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  login as apiLogin,
  refreshToken as apiRefreshToken,
  type AuthTokens,
} from '../api/auth-api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEYS = {
  accessToken: 'auth_access_token',
  idToken: 'auth_id_token',
  refreshToken: 'auth_refresh_token',
  expiresAt: 'auth_expires_at',
  email: 'auth_email',
} as const;

function saveTokens(tokens: AuthTokens, email: string) {
  const expiresAt = Date.now() + tokens.expiresIn * 1000;
  localStorage.setItem(TOKEN_KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(TOKEN_KEYS.idToken, tokens.idToken);
  localStorage.setItem(TOKEN_KEYS.refreshToken, tokens.refreshToken);
  localStorage.setItem(TOKEN_KEYS.expiresAt, expiresAt.toString());
  localStorage.setItem(TOKEN_KEYS.email, email);
}

function clearTokens() {
  Object.values(TOKEN_KEYS).forEach((key) => localStorage.removeItem(key));
}

function getStoredTokens() {
  const accessToken = localStorage.getItem(TOKEN_KEYS.accessToken);
  const refreshToken = localStorage.getItem(TOKEN_KEYS.refreshToken);
  const expiresAt = localStorage.getItem(TOKEN_KEYS.expiresAt);
  const email = localStorage.getItem(TOKEN_KEYS.email);
  return { accessToken, refreshToken, expiresAt, email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    setUserEmail(null);
  }, []);

  // Try to restore session on mount
  useEffect(() => {
    const tryRestore = async () => {
      const stored = getStoredTokens();

      if (!stored.accessToken || !stored.refreshToken || !stored.expiresAt) {
        setIsLoading(false);
        return;
      }

      const expiresAt = parseInt(stored.expiresAt, 10);
      const bufferMs = 60 * 1000; // 1 min buffer

      if (Date.now() < expiresAt - bufferMs) {
        // Token still valid
        setAccessToken(stored.accessToken);
        setUserEmail(stored.email);
      } else {
        // Try refresh
        try {
          const tokens = await apiRefreshToken(stored.refreshToken);
          saveTokens(tokens, stored.email || '');
          setAccessToken(tokens.accessToken);
          setUserEmail(stored.email);
        } catch {
          clearTokens();
        }
      }

      setIsLoading(false);
    };

    tryRestore();
  }, []);

  const loginHandler = useCallback(
    async (email: string, password: string) => {
      const tokens = await apiLogin(email, password);
      saveTokens(tokens, email);
      setAccessToken(tokens.accessToken);
      setUserEmail(email);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isLoading,
        accessToken,
        userEmail,
        login: loginHandler,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
