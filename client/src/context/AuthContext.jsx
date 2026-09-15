import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rbsk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('rbsk_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('rbsk_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session verify failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (mobile, password) => {
    const res = await api.post('/auth/login', { mobile, password });
    if (res.data.success) {
      const { token, ...userData } = res.data.data;
      localStorage.setItem('rbsk_token', token);
      localStorage.setItem('rbsk_user', JSON.stringify(userData));
      setUser(userData);
      return res.data;
    }
  };

  const register = async (name, mobile, password) => {
    const res = await api.post('/auth/register', { name, mobile, password });
    if (res.data.success) {
      const { token, ...userData } = res.data.data;
      localStorage.setItem('rbsk_token', token);
      localStorage.setItem('rbsk_user', JSON.stringify(userData));
      setUser(userData);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('rbsk_token');
    localStorage.removeItem('rbsk_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
