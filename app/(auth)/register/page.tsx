// app/signup/page.tsx
"use client";

import { MaterialPasswordField, MaterialTextField } from "@/components/common/CustomFields";
import { useSignupMutation } from "@/features/auth/authApiService";
import { useToast } from "@/hooks/useToast";
import AuthValidator from "@/utils/validators/auth.validator";
import {
  Email,
  Lock,
  Phone,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Typography
} from "@mui/material";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [signup, { isLoading, isError, error, isSuccess, data }] = useSignupMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: '',
    phone: "",
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values) => {
    try {
      await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }).unwrap();
    } catch (err: any) {
      console.error("Signup error:", err);
    }
  };

  useEffect(() => {
    if (isError) {
      toast.showToast(
        error?.data?.message || "Signup failed. Please try again.",
        "error"
      );
    }

    if (isSuccess) {
      toast.showToast(
        "Account created! Check your email for a verification code.",
        "success"
      );

      router.push(
        `/verify-otp?email=${encodeURIComponent(
          data?.data?.email?.toString() || ""
        )}`
      );
    }
  }, [isError, isSuccess]); // 🚀 NO toast here

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
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join us for freshly baked delights
              </Typography>
            </Box>

            <Formik
              initialValues={initialValues}
              validationSchema={AuthValidator.signUpSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <MaterialTextField
                      label="First Name"
                      name="firstName"
                    />
                    <MaterialTextField
                      label="Last Name"
                      name="lastName"
                    />
                  </Box>
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
                  <MaterialTextField
                    label="Phone Number (Optional)"
                    name="phone"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
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
                  <MaterialPasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    sx={{ mb: 3 }}
                    type={showConfirmPassword ? "text" : "password"}
                    startAdornment={(
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    )}
                    endAdornment={(
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                    {isLoading || isSubmitting ? <CircularProgress size={24} /> : "Sign Up"}
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
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}