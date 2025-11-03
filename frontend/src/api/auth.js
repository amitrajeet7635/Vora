// API utilities for authentication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authApi = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  },

  // Unlink provider
  unlinkProvider: async (provider) => {
    const response = await fetch(`${API_URL}/api/user/unlink/${provider}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to unlink ${provider}`);
    }

    return response.json();
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },
};
