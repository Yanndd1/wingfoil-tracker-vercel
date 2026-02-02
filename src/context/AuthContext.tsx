import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StravaAthlete } from '../types';
import * as stravaService from '../services/strava';
import { getTokens } from '../services/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  athlete: StravaAthlete | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = getTokens();
        if (tokens) {
          // Verify token is still valid
          const accessToken = await stravaService.getValidAccessToken();
          if (accessToken) {
            setIsAuthenticated(true);
            setAthlete(tokens.athlete || null);
          } else {
            setIsAuthenticated(false);
            setAthlete(null);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(() => {
    window.location.href = stravaService.getAuthUrl();
  }, []);

  const logout = useCallback(() => {
    stravaService.logout();
    setIsAuthenticated(false);
    setAthlete(null);
  }, []);

  const handleCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const tokens = await stravaService.exchangeCodeForTokens(code);
      setIsAuthenticated(true);
      setAthlete(tokens.athlete || null);
    } catch (error) {
      console.error('Failed to authenticate:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        athlete,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
