import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('crm_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      const rawUser = localStorage.getItem('crm_user');
      setUser(rawUser ? JSON.parse(rawUser) : null);
      setToken(localStorage.getItem('crm_token'));
    };

    window.addEventListener('crm_auth_change', handleAuthChange);

    // Verify token freshness with server safely in background
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('crm_token');
      if (!storedToken) {
        setChecking(false);
        return;
      }

      // If storedUser exists in localStorage, unlock UI immediately while validating in background
      const storedUser = localStorage.getItem('crm_user');
      if (storedUser) {
        setChecking(false);
      }

      try {
        const freshUser = await api.auth.getCurrentUser();
        if (freshUser) {
          localStorage.setItem('crm_user', JSON.stringify(freshUser));
          setUser(freshUser);
        }
      } catch (e) {
        console.warn('[useAuth] Background token validation warning:', e.message);
        // Only clear token if server explicitly rejected auth (401 / session expired)
        if (e.message?.toLowerCase().includes('expired') || e.message?.toLowerCase().includes('unauthorized') || e.message?.toLowerCase().includes('invalid')) {
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
          setUser(null);
          setToken(null);
        }
      } finally {
        setChecking(false);
      }
    };

    verifyToken();

    return () => {
      window.removeEventListener('crm_auth_change', handleAuthChange);
    };
  }, []);

  const loginUser = async (username, password) => {
    const data = await api.auth.login(username, password);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logoutUser = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    checking,
    isAuthenticated: !!token,
    login: loginUser,
    logout: logoutUser
  };
}
export default useAuth;
