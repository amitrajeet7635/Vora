// Auth Context for managing authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (err) {
      setUser(null);
      // Don't set error for initial load - user might just not be logged in
    } finally {
      setLoading(false);
    }
  };

  const login = async (provider) => {
    try {
      setError(null);
      // Redirect to OAuth provider
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/${provider}`;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const loginWithFacebook = async (facebookResponse) => {
    try {
      setError(null);
      setLoading(true);
      
      // Call backend to verify token and create session
      const userData = await authApi.facebookLogin(facebookResponse);
      setUser(userData);
      
      return userData;
    } catch (err) {
      setError(err.message || 'Facebook login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const linkProvider = async (provider) => {
    try {
      setError(null);
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/${provider}?link=true&userId=${user._id}`;
    } catch (err) {
      setError(err.message || 'Failed to link provider');
      throw err;
    }
  };

  const unlinkProvider = async (provider) => {
    try {
      setError(null);
      const updatedUser = await authApi.unlinkProvider(provider);
      setUser(updatedUser);
    } catch (err) {
      setError(err.message || 'Failed to unlink provider');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    loginWithFacebook,
    logout,
    linkProvider,
    unlinkProvider,
    refreshUser: checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
