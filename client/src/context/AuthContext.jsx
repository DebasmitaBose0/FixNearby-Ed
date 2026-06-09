import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContext
 * Provides { user, token, login, logout, isAuthenticated } to the entire tree.
 *
 * ## Security Architecture
 *
 * ### Current state (localStorage)
 * The token is currently stored in localStorage.  This is readable by any
 * JavaScript running on the page — including injected XSS payloads.  An
 * attacker who achieves XSS can steal the token and impersonate the user
 * from any machine until it expires.
 *
 * ### Recommended state (HttpOnly cookies)
 * The server should set the JWT in a `Set-Cookie` header with the flags:
 *   - `HttpOnly`  — prevents JavaScript from reading the cookie at all
 *   - `Secure`    — only sent over HTTPS
 *   - `SameSite=Strict` (or `Lax`) — mitigates CSRF
 *
 * In this model, the client never sees the token string.  The browser
 * sends it automatically on every request to the same origin.
 *
 * ### Migration path (this PR)
 * This PR introduces a `STORAGE_MODE` flag that switches between three modes:
 *   - 'localStorage'  (current, legacy — token in localStorage)
 *   - 'sessionStorage' (intermediate — token cleared on tab close)
 *   - 'cookie'        (target — token set by server, not stored client-side)
 *
 * In 'cookie' mode, `login()` stores only non-sensitive user metadata
 * (name, email) — never the token string.  The token lives exclusively in
 * the HttpOnly cookie managed by the browser.
 *
 * The server-side complement (setting `res.cookie()` with the correct flags
 * instead of returning the token in the JSON body) is tracked in the
 * companion backend task.
 *
 * user  – { _id, name, email } or null
 * token – JWT string (only present in non-cookie modes) or null
 * login(userData) – persists user + token per STORAGE_MODE
 * logout()        – clears state and requests server-side cookie deletion
 */

const AuthContext = createContext(null);

const STORAGE_KEY = 'fixnearby_user';

/**
 * Storage mode selector.
 *
 * Set VITE_AUTH_STORAGE_MODE=cookie in your .env to enable the HttpOnly
 * cookie flow once the server has been updated to call res.cookie().
 *
 * Valid values: 'localStorage' (default) | 'sessionStorage' | 'cookie'
 */
const STORAGE_MODE = import.meta.env.VITE_AUTH_STORAGE_MODE || 'localStorage';

const storage = STORAGE_MODE === 'sessionStorage' ? sessionStorage : localStorage;

const loadFromStorage = () => {
  if (STORAGE_MODE === 'cookie') {
    // In cookie mode the token lives in an HttpOnly cookie — JavaScript cannot
    // read it.  Load only the non-sensitive user profile from sessionStorage.
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => loadFromStorage());

  const login = useCallback((userData) => {
    if (STORAGE_MODE === 'cookie') {
      // Store only non-sensitive fields — token is in the HttpOnly cookie.
      const safe = { _id: userData._id, name: userData.name, email: userData.email };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      setAuthData(safe);
    } else {
      // Legacy localStorage / sessionStorage path.
      storage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setAuthData(userData);
    }
  }, []);

  const logout = useCallback(async () => {
    if (STORAGE_MODE === 'cookie') {
      sessionStorage.removeItem(STORAGE_KEY);
      // Ask the server to clear the HttpOnly cookie — client JS cannot do this.
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {
        // Best-effort; the token will expire naturally if the request fails.
      }
    } else {
      storage.removeItem(STORAGE_KEY);
    }
    setAuthData(null);
  }, []);

  const value = {
    user: authData ? {
      _id: authData._id,
      name: authData.name,
      email: authData.email,
      phone: authData.phone,
    } : null,
    // In cookie mode the token is never exposed to JavaScript.
    token: STORAGE_MODE === 'cookie' ? null : (authData?.token ?? null),
    isAuthenticated: !!authData,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;
