// features/auth/usePasswordlessAuth.ts
//
// The single passwordless-authentication path shared by every UI entry point
// (the cart LoginModal and the standalone /login page). Both call
// verifyPhoneAndAuthenticate(), so the MSG91 verification, the token handling
// and the POST /auth/login-passwordless call exist in exactly one place.
"use client";

import { useCallback } from 'react';
import {
  useLoginPasswordlessMutation,
  useRegisterPasswordlessMutation,
} from './authApiService';
import { setCredentials } from './authSlice';
import {
  saveEncryptedToken,
  saveRefreshToken,
} from '@/helpers/encryptToken.helper';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { sendPhoneOtp, verifyPhoneOtp } from './msg91Widget';

export type PrimaryProvider = 'email' | 'phone' | 'google' | null;

export type PasswordlessResult =
  /** Credentials are already persisted; the caller only has to navigate. */
  | { status: 'AUTHENTICATED' }
  /** No account yet: caller should store this as the primary token and collect a name. */
  | { status: 'NEW_USER'; token: string; provider: 'phone' }
  /** Phone verified as a secondary factor: caller should collect a name. */
  | { status: 'NEEDS_PROFILE'; token: string };

interface VerifyArgs {
  otp: string;
  reqId?: string;
  primaryProvider: PrimaryProvider;
  primaryToken?: string;
  firstName?: string;
  lastName?: string;
}

export function usePasswordlessAuth() {
  const dispatch = useAppDispatch();
  const guestCart = useAppSelector((state) => state.cart.items);
  const [loginPasswordless] = useLoginPasswordlessMutation();
  const [registerPasswordless] = useRegisterPasswordlessMutation();

  const persistLogin = useCallback(
    (accessToken: string, refreshToken: string, user: any) => {
      dispatch(setCredentials({ token: accessToken, user }));
      saveEncryptedToken(accessToken);
      saveRefreshToken(refreshToken);
    },
    [dispatch]
  );

  /** Sends the OTP via the shared MSG91 widget; resolves with the reqId. */
  const requestPhoneOtp = useCallback(
    (phone: string) => sendPhoneOtp(phone),
    []
  );

  /**
   * Verifies the OTP with MSG91, then authenticates against our own backend.
   * This is the ONLY place the phone passwordless login request is made.
   */
  const verifyPhoneAndAuthenticate = useCallback(
    async ({
      otp,
      reqId,
      primaryProvider,
      primaryToken,
      firstName,
      lastName,
    }: VerifyArgs): Promise<PasswordlessResult> => {
      const token = await verifyPhoneOtp(otp, reqId);

      if (!primaryProvider) {
        // Phone is the primary verification.
        console.log('[AUTH] loginPasswordless called (provider=phone, primary)');
        const result = await loginPasswordless({
          primaryToken: token,
          provider: 'phone',
          guestCart,
        }).unwrap();

        const data = result.data; // ResponseInterceptor unwrapping
        console.log('[AUTH] loginPasswordless response status:', data?.status);

        if (data.status === 'EXISTING_USER') {
          persistLogin(data.accessToken, data.refreshToken, data.user);
          return { status: 'AUTHENTICATED' };
        }
        return { status: 'NEW_USER', token, provider: 'phone' };
      }

      // Phone is a secondary verification. Google already carries the user's
      // name, so registration can complete immediately.
      if (primaryProvider === 'google') {
        const result = await registerPasswordless({
          primaryToken,
          primaryProvider,
          secondaryToken: token,
          secondaryProvider: 'phone',
          firstName,
          lastName,
          guestCart,
        }).unwrap();

        const data = result.data; // ResponseInterceptor unwrapping
        persistLogin(data.accessToken, data.refreshToken, data.user);
        return { status: 'AUTHENTICATED' };
      }

      return { status: 'NEEDS_PROFILE', token };
    },
    [loginPasswordless, registerPasswordless, guestCart, persistLogin]
  );

  return { requestPhoneOtp, verifyPhoneAndAuthenticate, persistLogin };
}
