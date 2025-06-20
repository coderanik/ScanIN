import api from '@/lib/api';
import { LoginRequest, RegisterRequest, User, ApiResponse } from '@/types';
import { setToken, setUser } from '@/lib/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
    
    if (response.data.success) {
      const { user, token } = response.data.data!;
      setToken(token);
      setUser(user);
      return { user, token };
    }
    
    throw new Error(response.data.message || 'Login failed');
  },

  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
    
    if (response.data.success) {
      const { user, token } = response.data.data!;
      setToken(token);
      setUser(user);
      return { user, token };
    }
    
    throw new Error(response.data.message || 'Registration failed');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to get user data');
  }
}; 