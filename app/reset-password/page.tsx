// app/reset-password/page.tsx
"use client";

import { MaterialPasswordField } from "@/components/common/CustomFields";
import { useResetPasswordMutation } from "@/features/user/userApiService";
import { useToast } from "@/hooks/useToast";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 25, label: "Weak", color: "#f44336" };
  if (score === 2) return { score: 50, label: "Fair", color: "#ff9800" };
  if (score === 3) return { score: 75, label: "Good", color: "#2196f3" };
  return { score: 100, label: "Strong", color: "#4caf50" };
}

const schema = Yup.object({
  password: Yup.string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "At least one uppercase letter")
    .matches(/[0-9]/, "At least one number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const token = searchParams.get("token") ?? "";

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  const strength = getStrength(passwordValue);

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      setDone(true);
      toast.showToast("Password updated successfully!", "success");
    } catch (err: any) {
      toast.showToast(
        err?.data?.message ?? "Link expired or invalid. Request a new one.",
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
                🔒
              </Box>
            </motion.div>

            {done ? (
              // ── Success ────────────────────────────────────────────────
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
                  All done! 🎉
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Your password has been reset. You can now sign in with your
                  new password.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/login")}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Go to sign in
                </Button>
              </motion.div>
            ) : (
              // ── Form ───────────────────────────────────────────────────
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
                  Set new password
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Choose something strong and memorable.
                </Typography>

                <Formik
                  initialValues={{ password: "", confirmPassword: "" }}
                  validationSchema={schema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, values }) => {
                    // Keep a local mirror for the strength meter
                    // (useField is inside Form, so we track via onChange below)
                    const pw = values.password;
                    const str = getStrength(pw);

                    return (
                      <Form>
                        <Box sx={{ textAlign: "left" }}>
                          <MaterialPasswordField
                            label="New Password"
                            name="password"
                            sx={{ mb: 1 }}
                            type={showPassword ? "text" : "password"}
                            startAdornment={
                              <InputAdornment position="start">
                                <Lock color="primary" />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword((v) => !v)}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            }
                          />

                          {/* Strength meter */}
                          {pw && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              style={{ marginBottom: 16 }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={str.score}
                                sx={{
                                  height: 5,
                                  borderRadius: 3,
                                  mb: 0.5,
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: str.color,
                                    borderRadius: 3,
                                  },
                                  backgroundColor: "rgba(0,0,0,0.06)",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: str.color, fontWeight: 600 }}
                              >
                                {str.label}
                              </Typography>
                            </motion.div>
                          )}

                          <MaterialPasswordField
                            label="Confirm Password"
                            name="confirmPassword"
                            sx={{ mb: 3 }}
                            type={showConfirm ? "text" : "password"}
                            startAdornment={
                              <InputAdornment position="start">
                                <Lock color="primary" />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirm((v) => !v)}
                                  edge="end"
                                >
                                  {showConfirm ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                        </Box>

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
                          }}
                        >
                          {isLoading || isSubmitting ? (
                            <CircularProgress size={22} sx={{ color: "white" }} />
                          ) : (
                            "Reset password"
                          )}
                        </Button>
                      </Form>
                    );
                  }}
                </Formik>

                <Box mt={3}>
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
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}