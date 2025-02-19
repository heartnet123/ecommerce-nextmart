import { User } from '@/app/types';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Wrapper for axios that handles token refresh
export async function fetchWithAuth(
  url: string,
  options: any = {}
): Promise<any> {
  // Add access token to request if available
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    };
  }

  try {
    let response = await axios(url, options);
    return response;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      const refreshSuccessful = await refreshToken();
      if (refreshSuccessful) {
        // Retry the request with new access token
        const newAccessToken = localStorage.getItem('accessToken');
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        };
        let response = await axios(url, options);
        return response;
      } else {
        // If refresh failed, clear tokens and throw error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        throw new Error('Session expired. Please login again.');
      }
    }
    throw error;
  }
}


export async function login(username: string, password: string): Promise<User | null> {
  try {
    console.log('Sending login request with:', { username, password });

    const response = await axios.post(`${API_URL}/auth/token/`, { username, password }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    console.log('Login response:', response.data);

    // Store tokens
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);

    // Also set in document cookie for middleware
    document.cookie = `accessToken=${response.data.access}; path=/; max-age=604800`; // 7 days

    return response.data.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data.error || error.message || 'Login failed');
  }
}

export async function register(name: string, username: string, password: string): Promise<User | null> {
  try {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const response = await axios.post(`${API_URL}/auth/register/`, {
      username,
      password,
      first_name: firstName,
      last_name: lastName || '',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data.error || error.response?.data.details || error.message || 'Registration failed');
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();
    await axios.post(`${API_URL}/auth/logout/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  // Clear tokens from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Clear cookie
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

export async function checkIsAdmin(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetchWithAuth(`${API_URL}/auth/is-admin/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return Boolean(response.data.is_staff);
  } catch (error) {
    console.error('Check admin status error:', error);
    return false;
  }
}

export async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      document.cookie = `accessToken=${response.data.access}; path=/; max-age=604800`; // 7 days
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    // Only remove tokens if refresh token is invalid/expired
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return false;
  }
}
