// components/auth/LoginModal.tsx
"use client";

import { useRequestOtpMutation, useVerifyOtpMutation } from '@/features/auth/authApiService';
import { setCredentials } from '@/features/auth/authSlice';
import { saveEncryptedToken } from '@/helpers/encryptToken.helper';
// import { syncServerCart } from '@/features/cart/cartSlice';
// import { requestOtp, verifyOtp } from '@/lib/authApi';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const guestCart = useAppSelector((state) => state.cart.items);

  const [requestOtp, { }] = useRequestOtpMutation();
  const [verifyOtp, { data: verifyOtpData, isSuccess: isVerifyOtpSuccess }] = useVerifyOtpMutation();

  const handleRequestOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await requestOtp(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerifyOtpSuccess && verifyOtpData) {
      dispatch(setCredentials({ token: verifyOtpData.data.accessToken, user: verifyOtpData.data.user }));
      saveEncryptedToken(verifyOtpData.data.accessToken);
    }
  }, [isVerifyOtpSuccess, verifyOtpData, dispatch]);

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await verifyOtp({ email, otp, guestCart });
      // Sync server cart after login (clear guest cart and load server cart)
      // Optionally fetch server cart here via another API call
      // dispatch(syncServerCart([])); // we'll replace with actual server cart fetch
      onSuccess?.();
      onClose();
      // Optionally reload server cart items
      // fetchServerCartAndSync();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{step === 'email' ? 'Login or Sign up' : 'Enter OTP'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {step === 'email' ? (
            <>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                variant="contained"
                onClick={handleRequestOtp}
                disabled={!email || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="6-digit OTP"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                disabled={loading}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button variant="contained" onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : 'Verify & Login'}
              </Button>
              <Button variant="text" onClick={() => setStep('email')} disabled={loading}>
                Back to email
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}