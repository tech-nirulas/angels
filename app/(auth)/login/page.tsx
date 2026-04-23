// Updated Login component with Material UI
// app/login/page.tsx
"use client";

import { MaterialPasswordField, MaterialTextField } from '@/components/common/CustomFields';
import { useLazyFetchUserQuery, useLoginMutation } from '@/features/auth/authApiService';
import { setCredentials } from '@/features/auth/authSlice';
import { saveEncryptedToken } from '@/helpers/encryptToken.helper';
import { useToast } from '@/hooks/useToast';
import { ErrorResponse } from '@/interfaces/root.interface';
import { useAppDispatch } from '@/lib/store';
import AuthValidator from '@/utils/validators/auth.validator';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { motion } from "framer-motion";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LoginValues {
  email: string;
  password: string;
}

function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [login, { isLoading, isError: isLoginError, error: loginError, data: loginData, isSuccess: isLoginSuccess, reset: resetLogin }] = useLoginMutation();
  const [fetchUser, { isLoading: isUserLoading, isSuccess: userSuccess, isError: isFetchingUserError, error: fetchingUserError, data: userData, reset: resetFetchingUser }] = useLazyFetchUserQuery();

  const { showToast } = useToast();

  // UseEffect for handling login api error
  useEffect(() => {
    if (isLoginError) {
      showToast((loginError as ErrorResponse)?.data?.message ?? 'Error Logging In.', 'error');
      resetLogin();
    }
  }, [isLoginError, loginError, showToast, resetLogin]);

  // UseEffect for handling user api error
  useEffect(() => {
    if (isFetchingUserError) {
      showToast((fetchingUserError as ErrorResponse)?.data?.message ?? 'Error Logging In', 'error');
    }
    resetFetchingUser();
  }, [isFetchingUserError, fetchingUserError, showToast, resetFetchingUser]);

  const initialValues = {
    email: '',
    password: '',
  };

  const handleLogin = async (values: LoginValues, { setSubmitting }: FormikHelpers<LoginValues>) => {
    try {
      await login({ email: values.email, password: values.password }).unwrap();
    } catch (err: any) {
      const message = err?.data?.message ?? '';

      // Try to parse structured error from backend
      try {
        const parsed = JSON.parse(message);
        if (parsed.code === 'EMAIL_NOT_VERIFIED') {
          showToast('Please verify your email. A new code has been sent.', 'warning');
          router.push(`/verify-otp?email=${encodeURIComponent(parsed.email)}`);
          return;
        }
      } catch {
        // Not a JSON error, fall through to generic handler
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isLoginSuccess && loginData) {
      console.log("🚀 ~ Login ~ loginData:", loginData)
      fetchUser(loginData?.data?.accessToken);
    }
  }, [isLoginSuccess, loginData, fetchUser]);

  useEffect(() => {
    if (userSuccess && userData && loginData) {
      dispatch(setCredentials({ user: userData, token: loginData?.data?.accessToken }));
      saveEncryptedToken(loginData?.data?.accessToken);
      showToast('Login Successful', 'success');
      router.push('/');
    }
  }, [userSuccess, userData, loginData, dispatch, showToast, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #FFF8F7 0%, #FFECEF 100%)",
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
            }}
          >
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  mb: 1,
                }}
              >
                Login to Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back! Please enter your details to continue.
              </Typography>
            </Box>

            <Formik
              initialValues={initialValues}
              validationSchema={AuthValidator.loginSchema}
              onSubmit={handleLogin}
            >
              {({ isSubmitting }) => (
                <Form>
                  <MaterialTextField
                    label="Email Address"
                    name="email"
                    type="email"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <MaterialPasswordField
                    label="Password"
                    name="password"
                    sx={{ mb: 2 }}
                    type={showPassword ? "text" : "password"}
                    startAdornment={(
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    )}
                    endAdornment={(
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    {isLoading || isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
                  </Button>
                </Form>
              )}
            </Formik>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  style={{
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Login;