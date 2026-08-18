// app/login/page.tsx
"use client";

import {
  useRequestOtpMutation,
  useVerifyEmailOtpMutation,
  useLoginPasswordlessMutation,
  useRegisterPasswordlessMutation,
} from '@/features/auth/authApiService';
import { setCredentials } from '@/features/auth/authSlice';
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

// Diagnostic-only: hashes a token for cross-checking against the backend's
// logged hash of the same value, without ever logging the token itself.
async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

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

  // Handles a verified MSG91 phone token, called from the verifyOtp per-call
  // success callback (the documented-authoritative channel for exposeMethods/custom UI)
  const handleMsg91Success = async (token: string) => {
    console.log('[AUTH] handleMsg91Success called. primaryProvider:', primaryProvider);
    setLoading(true);
    setError('');
    try {
      if (!primaryProvider) {
        // Phone is primary verification
        console.log('[AUTH] loginPasswordless called (provider=phone, primary)');
        const result = await loginPasswordless({
          primaryToken: token,
          provider: 'phone',
          guestCart,
        }).unwrap();

        const data = result.data; // ResponseInterceptor unwrapping
        console.log('[AUTH] loginPasswordless response status:', data?.status);

        if (data.status === 'EXISTING_USER') {
          handleLoginSuccess(data.accessToken, data.refreshToken, data.user);
        } else if (data.status === 'NEW_USER') {
          setPrimaryToken(token);
          setPrimaryProvider('phone');
          // Skip secondary email, go directly to name entry
          setStep('complete-profile');
        }
      } else {
        // Phone is secondary verification
        setSecondaryToken(token);
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
          handleLoginSuccess(data.accessToken, data.refreshToken, data.user);
        } else {
          setStep('complete-profile');
        }
      }
    } catch (err: any) {
      console.log('[AUTH] handleMsg91Success failed:', err?.data?.message || err.message);
      setError(err?.data?.message || err.message || 'Phone verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Script loaders for MSG91 and Google Client GSI SDK
  useEffect(() => {
    // Load MSG91 script
    const loadMsg91Script = () => {
      if ((window as any).initSendOTP) {
        initOtpWidget();
        return;
      }
      // Avoid appending a second <script> tag (and re-registering the widget
      // on top of an in-flight load) if this effect somehow re-runs before
      // the first load has finished.
      const existing = document.querySelector(
        'script[src="https://verify.msg91.com/otp-provider.js"]'
      ) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', initOtpWidget, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://verify.msg91.com/otp-provider.js';
      script.async = true;
      script.onload = () => {
        initOtpWidget();
      };
      document.head.appendChild(script);
    };

    const initOtpWidget = () => {
      const configuration = {
        widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '366644664c4a323237353039',
        tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '512331Tv4ORqfJ6a436578P1',
        exposeMethods: true,
        // NOTE: authentication is handled via the callbacks passed directly into
        // window.verifyOtp() in handleVerifyPhoneOtp (the documented channel for
        // exposeMethods/custom-UI integrations) — mirrors LoginModal.tsx. These
        // config-level callbacks are diagnostic only; see that file for the full
        // rationale (MSG91 docs: using both fires "2 events" for the same result).
        success: (data: any) => {
          console.log('[MSG91] global configuration.success fired (diagnostic only). keys:', Object.keys(data || {}));
        },
        failure: (err: any) => {
          console.log('[MSG91] global configuration.failure fired (diagnostic only):', err);
        },
      };
      if (typeof (window as any).initSendOTP === 'function') {
        (window as any).initSendOTP(configuration);
      }
    };

    loadMsg91Script();

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

  // Handle Request Phone OTP
  const handleRequestPhoneOtp = () => {
    setError('');
    const win = window as any;
    if (win.sendOtp) {
      setLoading(true);
      let cleanedPhone = phone.replace(/\D/g, '');
      if (!cleanedPhone.startsWith('91')) {
        cleanedPhone = '91' + cleanedPhone;
      }
      win.sendOtp(
        cleanedPhone,
        (data: any) => {
          // MSG91 returns the reqId for this OTP request; store it so verifyOtp
          // can be called with an explicit reqId per the documented signature
          // window.verifyOtp(otp, success, failure, reqId).
          phoneReqIdRef.current = data?.reqId ?? data?.reqid ?? data?.message ?? undefined;
          console.log('[MSG91] sendOtp success. reqId captured:', !!phoneReqIdRef.current);
          setLoading(false);
          setStep('phone-otp');
        },
        (err: any) => {
          setLoading(false);
          setError(typeof err === 'string' ? err : err.message || 'Failed to send SMS OTP');
        }
      );
    } else {
      setError('MSG91 Widget is not initialized yet. Please try again.');
    }
  };

  // Handle Verify Phone OTP
  const handleVerifyPhoneOtp = () => {
    if (loading) return; // guard against double-submit (button is also disabled while loading)
    setError('');
    const win = window as any;
    if (!win.verifyOtp) {
      setError('MSG91 Widget error: verify method not found');
      return;
    }
    setLoading(true);
    console.log('[MSG91] verifyOtp called. reqId present:', !!phoneReqIdRef.current);
    win.verifyOtp(
      otp,
      (response: any) => {
        // This is the documented-authoritative callback for exposeMethods/custom UI.
        // Confirmed against MSG91's actual otp-provider.js source: for the explicit
        // verifyOtp path this callback receives the RAW HTTP response body
        // untransformed — { type, data, activity_response } — and the token is
        // under `.data`. See LoginModal.tsx for the full trace.
        const token = response?.data || response?.message || response?.['access-token'] || response?.token;
        console.log('[MSG91] verifyOtp response diagnostic:', {
          keys: Object.keys(response || {}),
          tokenLength: token?.length,
          tokenParts: token?.split('.')?.length,
        });
        if (token) {
          sha256Hex(token).then((hash) => console.log('[MSG91] token sha256:', hash));
        }
        if (!token) {
          setLoading(false);
          setError('OTP verified but no access token was returned. Please try again.');
          return;
        }
        handleMsg91Success(token);
      },
      (err: any) => {
        console.log('[MSG91] verifyOtp failure callback fired:', err);
        setLoading(false);
        setError(typeof err === 'string' ? err : err.message || 'OTP verification failed');
      },
      phoneReqIdRef.current
    );
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