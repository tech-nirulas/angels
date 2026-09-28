// lib/AuthProvider.tsx
"use client";

import { useLazyFetchUserQuery } from '@/features/auth/authApiService';
import { logout, setLoading, setUser } from '@/features/auth/authSlice';
import getDecryptedToken from '@/helpers/decryptToken.helper';
import { loginPathFor } from '@/helpers/safeRedirect.helper';
import { isPublicPath } from '@/constants/routes';
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

  // Prefix-matched, and shared with the login redirect (constants/routes.ts).
  const isPublicRoute = isPublicPath(pathname);
  // Read in the effects below, not here: useSearchParams() in a root provider
  // forces a Suspense boundary on every route and deopts static prerender.
  const currentSearch = () =>
    typeof window === 'undefined' ? '' : window.location.search;

  const checkAuth = async () => {
    try {
      dispatch(setLoading(true));
      const token = await getDecryptedToken();

      if (!token) {
        dispatch(logout());
        if (!isPublicRoute) {
          // Carry the destination so login can return the user to it.
          router.push(loginPathFor(pathname, currentSearch()));
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
        router.push(loginPathFor(pathname, currentSearch()));
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
      router.push(loginPathFor(pathname, currentSearch()));
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

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