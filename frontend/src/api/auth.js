// API utilities for authentication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const authApi = {
  // Get user profile with retry logic for OAuth callback scenarios
  getProfile: async (retries = 2, delay = 300) => {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Build headers - include Authorization if token exists in localStorage
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Try localStorage token first (for browsers that block third-party cookies)
        const token = localStorage.getItem('vora_access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/api/user/me`, {
          method: 'GET',
          credentials: 'include', // Still include cookies as fallback
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // If this is not the last attempt and we get 401, retry after delay
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error('Not authenticated');
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        return data.user; // Extract user object from response
      } catch (error) {
        lastError = error;
        // If not the last attempt, wait before retrying
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed, throw the last error
    throw lastError;
  },

  // Facebook login with access token
  facebookLogin: async (facebookResponse) => {
    const response = await fetch(`${API_URL}/api/auth/facebook/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: facebookResponse.accessToken,
        userID: facebookResponse.userID,
        email: facebookResponse.email,
        name: facebookResponse.name,
        picture: facebookResponse.picture,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Facebook login failed');
    }

    const data = await response.json();
    return data.user;
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('vora_access_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers,
    });

    // Clear localStorage tokens
    localStorage.removeItem('vora_access_token');
    localStorage.removeItem('vora_refresh_token');

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  },

  // Unlink provider
  unlinkProvider: async (provider) => {
    const token = localStorage.getItem('vora_access_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/auth/unlink/${provider}`, {
      method: 'POST',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to unlink ${provider}`);
    }

    const data = await response.json();
    return data.user; // Extract user object from response
  },

  // Update profile
  updateProfile: async (data) => {
    const token = localStorage.getItem('vora_access_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/user/me`, {
      method: 'PATCH',
      credentials: 'include',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const result = await response.json();
    return result.user; // Extract user object from response
  },
};
