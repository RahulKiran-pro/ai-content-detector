import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('truthlens_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('truthlens_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('truthlens_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('truthlens_token');
      localStorage.removeItem('truthlens_user');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const safeFetchJson = async (url, options = {}) => {
    let res;
    try {
      res = await fetch(url, options);
    } catch (netErr) {
      throw new Error(`Connection error (${netErr.message || 'Failed to fetch'}). Please verify backend status and VITE_API_URL deployment configuration.`);
    }

    const contentType = res.headers.get('content-type') || '';
    let data = {};

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e) {
        data = { error: 'Invalid JSON response received from backend.' };
      }
    } else {
      const text = await res.text();
      data = { error: text || `Server HTTP Error ${res.status}` };
    }

    if (!res.ok) {
      throw new Error(data.message || data.error || `Server HTTP Error ${res.status}`);
    }

    return data;
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const data = await safeFetchJson(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem('truthlens_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.warn('[Profile Fetch Warning]', e.message);
      if (e.message.includes('401') || e.message.includes('403')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    if (!token) return false;
    await fetchUserProfile(token);
    return Boolean(token && user);
  };

  const login = async (email, password) => {
    const data = await safeFetchJson(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('truthlens_token', data.token);
      localStorage.setItem('truthlens_user', JSON.stringify(data.user));
      setLoading(false);
    }
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await safeFetchJson(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('truthlens_token', data.token);
      localStorage.setItem('truthlens_user', JSON.stringify(data.user));
      setLoading(false);
    }
    return data;
  };

  const loginWithGoogle = async (idToken) => {
    const data = await safeFetchJson(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('truthlens_token', data.token);
      localStorage.setItem('truthlens_user', JSON.stringify(data.user));
      setLoading(false);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('truthlens_token');
    localStorage.removeItem('truthlens_user');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      signup,
      register: signup,
      loginWithGoogle,
      logout,
      checkAuth
    }}>
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
