// app/login/page.tsx
"use client";

import {
  useRequestOtpMutation,
  useVerifyEmailOtpMutation,
  useLoginPasswordlessMutation,
  useRegisterPasswordlessMutation,
} from '@/features/auth/authApiService';
import { setCredentials } from '@/features/auth/authSlice';
import { usePasswordlessAuth } from '@/features/auth/usePasswordlessAuth';
import { ensureMsg91Widget } from '@/features/auth/msg91Widget';
import { saveEncryptedToken, saveRefreshToken } from '@/helpers/encryptToken.helper';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type AuthStep =
  | 'select'
  | 'email'
  | 'email-otp'
  | 'phone'
  | 'phone-otp'
  | 'complete-profile';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const guestCart = useAppSelector((state) => state.cart.items);

  const [step, setStep] = useState<AuthStep>('select');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Passwordless authentication states
  const [primaryToken, setPrimaryToken] = useState('');
  const [primaryProvider, setPrimaryProvider] = useState<'email' | 'phone' | 'google' | null>(null);
  const [secondaryToken, setSecondaryToken] = useState('');
  const [secondaryProvider, setSecondaryProvider] = useState<'email' | 'phone' | null>(null);

  // reqId returned by MSG91's sendOtp; passed explicitly to verifyOtp per MSG91's
  // documented custom-UI signature: window.verifyOtp(otp, success, failure, reqId)
  const phoneReqIdRef = useRef<string | undefined>(undefined);

  // Mutations
  const [requestOtp] = useRequestOtpMutation();
  const [verifyEmailOtp] = useVerifyEmailOtpMutation();
  const [loginPasswordless] = useLoginPasswordlessMutation();
  const [registerPasswordless] = useRegisterPasswordlessMutation();

  // Shared passwordless auth path (identical to the cart LoginModal)
  const { requestPhoneOtp, verifyPhoneAndAuthenticate } = usePasswordlessAuth();

  // Login success helper
  const handleLoginSuccess = (accessToken: string, refreshToken: string, user: any) => {
    dispatch(setCredentials({ token: accessToken, user }));
    saveEncryptedToken(accessToken);
    saveRefreshToken(refreshToken);
    router.push('/');
  };

  // Google OAuth Success Callback
  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const result = await loginPasswordless({
        primaryToken: response.credential,
        provider: 'google',
        guestCart,
      }).unwrap();

      const data = result.data; // ResponseInterceptor unwrapping

      if (data.status === 'EXISTING_USER') {
        handleLoginSuccess(data.accessToken, data.refreshToken, data.user);
      } else if (data.status === 'NEW_USER') {
        setPrimaryToken(response.credential);
        setPrimaryProvider('google');
        setSecondaryProvider('phone');
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        // Go to secondary phone verification
        setStep('phone');
      }
    } catch (err: any) {
      setError(err?.data?.message || err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Script loaders for MSG91 and Google Client GSI SDK
  useEffect(() => {
    // Initialise the MSG91 widget through the shared singleton. It must only
    // ever be initialised once per page load — see features/auth/msg91Widget.ts.
    ensureMsg91Widget().catch((err) =>
      console.log('[MSG91] widget init failed:', err?.message)
    );

    // Load Google GSI SDK
    const loadGoogleScript = () => {
      if ((window as any).google) {
        initGoogleSignIn();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        initGoogleSignIn();
      };
      document.head.appendChild(script);
    };

    const initGoogleSignIn = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '785311894982-f3f6oou8pq73e72fl2bfe1bcr01t7mep.apps.googleusercontent.com',
          callback: handleGoogleCallback,
        });
        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-page'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    };

    loadGoogleScript();
  }, []);

  // Handle Request Email OTP
  const handleRequestEmailOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await requestOtp(email).unwrap();
      setStep('email-otp');
    } catch (err: any) {
      setError(err?.data?.message || err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await verifyEmailOtp({ email, otp }).unwrap();
      const token = result.data.emailVerificationToken; // ResponseInterceptor unwrapping

      if (!primaryProvider) {
        // Email is primary verification
        const loginRes = await loginPasswordless({
          primaryToken: token,
          provider: 'email',
          guestCart,
        }).unwrap();

        const data = loginRes.data; // ResponseInterceptor unwrapping

        if (data.status === 'EXISTING_USER') {
          handleLoginSuccess(data.accessToken, data.refreshToken, data.user);
        } else if (data.status === 'NEW_USER') {
          setPrimaryToken(token);
          setPrimaryProvider('email');
          // Go directly to Complete Profile
          setStep('complete-profile');
        }
      } else {
        // Email is secondary verification
        setSecondaryToken(token);
        setStep('complete-profile');
      }
    } catch (err: any) {
      setError(err?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Request Phone OTP — via the shared MSG91 widget
  const handleRequestPhoneOtp = async () => {
    setError('');
    setLoading(true);
    try {
      phoneReqIdRef.current = await requestPhoneOtp(phone);
      setStep('phone-otp');
    } catch (err: any) {
      setError(err?.message || 'Failed to send SMS OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Phone OTP — via the shared passwordless auth path
  const handleVerifyPhoneOtp = async () => {
    if (loading) return; // guard against double-submit while verification is in flight
    setError('');
    setLoading(true);
    try {
      const result = await verifyPhoneAndAuthenticate({
        otp,
        reqId: phoneReqIdRef.current,
        primaryProvider,
        primaryToken,
        firstName,
        lastName,
      });

      if (result.status === 'AUTHENTICATED') {
        router.push('/');
      } else if (result.status === 'NEW_USER') {
        setPrimaryToken(result.token);
        setPrimaryProvider('phone');
        setStep('complete-profile');
      } else {
        setSecondaryToken(result.token);
        setSecondaryProvider('phone');
        setStep('complete-profile');
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Complete Profile
  const handleRegister = async () => {
    if (!firstName || !lastName) {
      setError('Both first name and last name are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await registerPasswordless({
        primaryToken,
        primaryProvider,
        secondaryToken,
        secondaryProvider,
        firstName,
        lastName,
        guestCart,
      }).unwrap();
      const data = result.data; // ResponseInterceptor unwrapping
      handleLoginSuccess(data.accessToken, data.refreshToken, data.user);
    } catch (err: any) {
      setError(err?.data?.message || err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #FFF8F7 0%, #FFECEF 100%)",
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: "white",
              boxShadow: "var(--shadow-soft)",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 3 }}>
              {step === 'select' && 'Welcome to Angels'}
              {step === 'email' && 'Email Verification'}
              {step === 'email-otp' && 'Verify Email OTP'}
              {step === 'phone' && 'Phone Verification'}
              {step === 'phone-otp' && 'Verify Phone OTP'}
              {step === 'complete-profile' && 'Complete Profile'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {step === 'select' && (
                <>
                  {/* Google Button */}
                  <Box id="google-signin-btn-page" sx={{ minHeight: 40, width: '100%' }} />

                  <Divider sx={{ my: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  {/* Continue with Email */}
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => setStep('email')}
                    sx={{ py: 1.2, textTransform: 'none' }}
                  >
                    Continue with Email
                  </Button>

                  {/* Continue with Phone */}
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => setStep('phone')}
                    sx={{ py: 1.2, textTransform: 'none' }}
                  >
                    Continue with Mobile Number
                  </Button>
                </>
              )}

              {step === 'email' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {primaryProvider
                      ? 'Please verify your Email address as your secondary contact method.'
                      : 'Enter your Email address to login or register.'}
                  </Typography>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    variant="contained"
                    onClick={handleRequestEmailOtp}
                    disabled={!email || loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                  </Button>
                  <Button variant="text" onClick={() => setStep('select')} disabled={loading}>
                    Back
                  </Button>
                </>
              )}

              {step === 'email-otp' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Please enter the 6-digit OTP sent to <strong>{email}</strong>
                  </Typography>
                  <TextField
                    label="Email OTP Code"
                    fullWidth
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    disabled={loading}
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    variant="contained"
                    onClick={handleVerifyEmailOtp}
                    disabled={otp.length !== 6 || loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
                  </Button>
                  <Button variant="text" onClick={() => setStep('email')} disabled={loading}>
                    Back
                  </Button>
                </>
              )}

              {step === 'phone' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {primaryProvider
                      ? 'Please verify your Mobile number as your secondary contact method.'
                      : 'Enter your Mobile number to login or register.'}
                  </Typography>
                  <TextField
                    label="Mobile Number"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. 9876543210"
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    variant="contained"
                    onClick={handleRequestPhoneOtp}
                    disabled={!phone || loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Mobile OTP'}
                  </Button>
                  <Button variant="text" onClick={() => setStep('select')} disabled={loading}>
                    Back
                  </Button>
                </>
              )}

              {step === 'phone-otp' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Please enter the OTP sent to <strong>{phone}</strong>
                  </Typography>
                  <TextField
                    label="Mobile OTP Code"
                    fullWidth
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    variant="contained"
                    onClick={handleVerifyPhoneOtp}
                    disabled={!otp || loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
                  </Button>
                  <Button variant="text" onClick={() => setStep('phone')} disabled={loading}>
                    Back
                  </Button>
                </>
              )}

              {step === 'complete-profile' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    We verified your details successfully! Please tell us your name to complete registration.
                  </Typography>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    variant="contained"
                    onClick={handleRegister}
                    disabled={!firstName || !lastName || loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}