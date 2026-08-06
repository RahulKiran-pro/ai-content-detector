import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('truthlens_user', JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (e) {
      console.warn('Profile fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('truthlens_user', JSON.stringify(data.user));
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('truthlens_user', JSON.stringify(data.user));
    return data;
  };

  const loginWithGoogle = async (idToken) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google login failed.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('truthlens_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('truthlens_token');
    localStorage.removeItem('truthlens_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      signup,
      loginWithGoogle,
      logout
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
