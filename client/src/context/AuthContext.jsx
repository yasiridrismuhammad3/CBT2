// 
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('damale_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('damale_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');

          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('damale_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }

      setLoading(false);
    };

    verifyUser();
  }, [token]);

  // ===========================
  // Admin / Teacher Login
  // ===========================
  const login = async (identifier, password) => {
    const res = await API.post('/auth/login', {
      identifier,
      password
    });

    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);

      localStorage.setItem('damale_token', res.data.token);
      localStorage.setItem('damale_user', JSON.stringify(res.data.user));
    }

    return res.data;
  };

  // ===========================
  // Student Login (DS Number Only)
  // ===========================
  const studentLogin = async (dsNumber) => {
    const res = await API.post('/auth/student-login', {
      dsNumber
    });

    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);

      localStorage.setItem('damale_token', res.data.token);
      localStorage.setItem('damale_user', JSON.stringify(res.data.user));
    }

    return res.data;
  };

  // ===========================
  // Logout
  // ===========================
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('damale_token');
    localStorage.removeItem('damale_user');
  };

  // ===========================
  // Update User
  // ===========================
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('damale_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        studentLogin,
        logout,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);