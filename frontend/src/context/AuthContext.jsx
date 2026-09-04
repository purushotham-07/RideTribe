import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ridetribe_token'));
  const [loading, setLoading] = useState(true);

  // Check saved session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ridetribe_token');
      if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (_) {
          // Token expired or invalid -> clean up gracefully
          localStorage.removeItem('ridetribe_token');
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem('ridetribe_token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('ridetribe_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('ridetribe_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async (email, name, avatarUrl) => {
    const data = await api.googleLogin({ email, name, avatarUrl });
    localStorage.setItem('ridetribe_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await api.updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem('ridetribe_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      return userData;
    } catch (_) {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      googleLogin,
      updateProfile,
      logout,
      refreshUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
