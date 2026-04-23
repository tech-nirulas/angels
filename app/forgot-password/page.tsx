// app/forgot-password/page.tsx
"use client";

import { MaterialTextField } from "@/components/common/CustomFields";
import { useForgotPasswordMutation } from "@/features/user/userApiService";
import { useToast } from "@/hooks/useToast";
import { Email } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import * as Yup from "yup";

const schema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
});

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const handleSubmit = async (values: { email: string }) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      setSentTo(values.email);
      setSubmitted(true);
    } catch (err: any) {
      toast.showToast(
        err?.data?.message ?? "Something went wrong. Please try again.",
        "error"
      );
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FFD6D6, #FFECEF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  fontSize: "2rem",
                }}
              >
                🔑
              </Box>
            </motion.div>

            {submitted ? (
              // ── Success state ──────────────────────────────────────────
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    mb: 1.5,
                  }}
                >
                  Check your inbox
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  We&apos;ve sent password reset instructions to
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 3 }}>
                  {sentTo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Didn&apos;t get an email? Check your spam folder or{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: "primary.main",
                      cursor: "pointer",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => setSubmitted(false)}
                  >
                    try again
                  </Typography>
                  .
                </Typography>
              </motion.div>
            ) : (
              // ── Form state ─────────────────────────────────────────────
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    mb: 1,
                  }}
                >
                  Forgot password?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  No worries — enter your email and we&apos;ll send you reset
                  instructions.
                </Typography>

                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={schema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <MaterialTextField
                        label="Email Address"
                        name="email"
                        type="email"
                        sx={{ mb: 3, textAlign: "left" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading || isSubmitting}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: "1rem",
                          fontWeight: 600,
                          textTransform: "none",
                          mb: 2,
                        }}
                      >
                        {isLoading || isSubmitting ? (
                          <CircularProgress size={22} sx={{ color: "white" }} />
                        ) : (
                          "Send reset link"
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </>
            )}

            <Box mt={2}>
              <Link
                href="/login"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                ← Back to sign in
              </Link>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}