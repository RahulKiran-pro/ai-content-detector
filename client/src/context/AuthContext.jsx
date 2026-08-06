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

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('truthlens_user', JSON.stringify(data.user));
      } else {
        if (res.status === 401 || res.status === 403) {
          logout();
        }
      }
    } catch (e) {
      console.warn('Profile fetch failed:', e);
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
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Login failed.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('truthlens_token', data.token);
    localStorage.setItem('truthlens_user', JSON.stringify(data.user));
    setLoading(false);
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed.');
    }
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
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Google login failed.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('truthlens_token', data.token);
    localStorage.setItem('truthlens_user', JSON.stringify(data.user));
    setLoading(false);
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
