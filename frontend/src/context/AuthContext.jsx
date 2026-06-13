import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('access_token');
    const savedUsername = localStorage.getItem('username') || 'User';
    if (token) {
      setUser({ authenticated: true, username: savedUsername });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);
      setUser({ authenticated: true, username });
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.post('/auth/register/', { username, email, password });
      return await login(username, password);
    } catch (error) {
      console.error('Registration error', error);
      return { success: false, error: 'Registration failed. Username might be taken.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
