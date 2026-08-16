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

    // Verify token freshness with server
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('crm_token');
      if (storedToken) {
        try {
          const freshUser = await api.auth.getCurrentUser();
          localStorage.setItem('crm_user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (e) {
          console.warn('[useAuth] Token validation failed:', e.message);
          // Fallback clears invalid token
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
          setUser(null);
          setToken(null);
        }
      }
      setChecking(false);
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
