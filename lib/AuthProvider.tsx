// lib/AuthProvider.tsx
"use client";

import { useLazyFetchUserQuery } from '@/features/auth/authApiService';
import { logout, setLoading, setUser } from '@/features/auth/authSlice';
import getDecryptedToken from '@/helpers/decryptToken.helper';
import { CircularProgress } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './store';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  checkAuth: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Fix: Access the correct path in your Redux store
  // Since your reducer is exported as authReducer, it will be at state.authReducer
  const authState = useAppSelector((state: any) => state.auth);
  console.log("🚀 ~ AuthProvider ~ authState:", authState)
  const { isAuthenticated = false, isLoading, user = null } = authState || {};

  const [fetchUser, { isLoading: isFetchingUser }] = useLazyFetchUserQuery();

  const publicRoutes = ['/login', '/register', '/', '/menu', '/cart'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const checkAuth = async () => {
    try {
      dispatch(setLoading(true));
      const token = await getDecryptedToken();

      if (!token) {
        dispatch(logout());
        if (!isPublicRoute) {
          router.push('/login');
        }
        return;
      }

      // Fetch user data with token
      const userData = await fetchUser(token).unwrap();
      dispatch(setUser(userData));
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch(logout());
      if (!isPublicRoute) {
        router.push('/login');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      // Clear encrypted storage
      localStorage.removeItem('encryptionKey');
      localStorage.removeItem('iv');
      localStorage.removeItem('encryptedToken');

      dispatch(logout());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authState && !isAuthenticated && !isPublicRoute) {
      console.log("Came here??")
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading: isLoading || isFetchingUser,
      user,
      checkAuth,
      handleLogout,
    }),
    [isAuthenticated, isLoading, isFetchingUser, user]
  );

  // Show loading state while checking authentication
  console.log("🚀 ~ AuthProvider ~ isLoading:", isLoading)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};