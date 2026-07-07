// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  AuthContextType,
  ForgotPasswordResponse,
  VerifyCodeResponse,
  ResetPasswordResponse
} from '../types/index';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Extend AuthContextType for password reset methods
interface ExtendedAuthContextType extends AuthContextType {
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  verifyResetCode: (email: string, code: string) => Promise<VerifyCodeResponse>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<ResetPasswordResponse>;
}

const ExtendedAuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export const useExtendedAuth = (): ExtendedAuthContextType => {
  const context = useContext(ExtendedAuthContext);
  if (!context) {
    throw new Error('useExtendedAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(
        'https://kingsconcept.com.ng/esm/api/login',
        credentials
      );

      if (response.data.success && response.data.token && response.data.user) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error.response.data as LoginResponse;
      }
      throw { error: 'Network error', success: false };
    }
  };

  const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await axios.post<ForgotPasswordResponse>(
        'https://kingsconcept.com.ng/esm/api/forgot-password',
        { email }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error.response.data;
      }
      throw { error: 'Network error', success: false };
    }
  };

  const verifyResetCode = async (email: string, code: string): Promise<VerifyCodeResponse> => {
    try {
      const response = await axios.post<VerifyCodeResponse>(
        'https://kingsconcept.com.ng/esm/api/verify-reset-code',
        { email, code }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error.response.data;
      }
      throw { error: 'Network error', success: false };
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await axios.post<ResetPasswordResponse>(
        'https://kingsconcept.com.ng/esm/api/reset-password',
        { email, token, new_password: newPassword }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error.response.data;
      }
      throw { error: 'Network error', success: false };
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    axios.post('https://kingsconcept.com.ng/esm/api/logout')
      .catch(error => console.error('Logout API error:', error));
  };

  const value: ExtendedAuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user,
    forgotPassword,
    verifyResetCode,
    resetPassword
  };

  return (
    <ExtendedAuthContext.Provider value={value}>
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    </ExtendedAuthContext.Provider>
  );
};