// app/verify-otp/page.tsx
"use client";

import { useResendOtpMutation, useVerifyOtpMutation } from "@/features/auth/authApiService";
import { setCredentials } from "@/features/auth/authSlice";
import { useMergeCartMutation } from "@/features/cart/cartApiService";
import { clearGuestCart, selectGuestCartItems } from "@/features/cart/cartSlice";
import { saveEncryptedToken } from "@/helpers/encryptToken.helper";
import { useToast } from "@/hooks/useToast";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [mergeCart] = useMergeCartMutation();
  const guestItems = useAppSelector(selectGuestCartItems);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Redirect if no email param
  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  const focusInput = (idx: number) => {
    inputRefs.current[idx]?.focus();
  };

  const handleChange = useCallback(
    (idx: number, value: string) => {
      // Accept only digits; handle paste of full OTP
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH - idx);
      if (!digits) return;

      const next = [...otp];
      for (let i = 0; i < digits.length; i++) {
        if (idx + i < OTP_LENGTH) next[idx + i] = digits[i];
      }
      setOtp(next);

      // Move focus forward
      const nextFocus = Math.min(idx + digits.length, OTP_LENGTH - 1);
      focusInput(nextFocus);
    },
    [otp]
  );

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        focusInput(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusInput(idx - 1);
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      focusInput(idx + 1);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.showToast("Please enter the full 6-digit code.", "error");
      return;
    }

    try {
      const result = await verifyOtp({ email, otp: code }).unwrap();

      dispatch(
        setCredentials({
          token: result.data.accessToken,
          user: result.data.user,
        })
      );

      saveEncryptedToken(result.data.accessToken);

      // Merge any guest cart items after login
      if (guestItems.length > 0) {
        await mergeCart({
          items: guestItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        });
        dispatch(clearGuestCart());
      }

      toast.showToast("Email verified! Welcome aboard 🎉", "success");
      router.push("/");
    } catch (err: any) {
      toast.showToast(
        err?.data?.message ?? "Invalid or expired code. Try again.",
        "error"
      );
      // Clear OTP and refocus first input on error
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => focusInput(0), 50);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email }).unwrap();
      setCooldown(RESEND_COOLDOWN);
      toast.showToast("A new code has been sent to your email.", "success");
    } catch (err: any) {
      toast.showToast(err?.data?.message ?? "Failed to resend code.", "error");
    }
  };

  const isComplete = otp.every((d) => d !== "");

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
            {/* Icon */}
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
                ✉️
              </Box>
            </motion.div>

            <Typography
              variant="h5"
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-primary)",
                mb: 1,
              }}
            >
              Check your email
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              We sent a 6-digit code to
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 4, wordBreak: "break-all" }}
            >
              {email}
            </Typography>

            {/* OTP input boxes */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 1, sm: 1.5 },
                justifyContent: "center",
                mb: 4,
              }}
            >
              {otp.map((digit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                >
                  <Box
                    component="input"
                    ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[idx] = el;
                    }}
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    value={digit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(idx, e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(idx, e)
                    }
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                      e.target.select()
                    }
                    sx={{
                      width: { xs: 42, sm: 48 },
                      height: { xs: 52, sm: 60 },
                      textAlign: "center",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      border: (theme) =>
                        `2px solid ${digit
                          ? theme.palette.primary.main
                          : theme.palette.divider
                        }`,
                      borderRadius: "12px",
                      outline: "none",
                      background: (theme) =>
                        digit
                          ? `${theme.palette.primary.main}08`
                          : "transparent",
                      color: "text.primary",
                      transition: "all 0.2s ease",
                      cursor: "text",
                      "&:focus": {
                        borderColor: "primary.main",
                        boxShadow: (theme) =>
                          `0 0 0 3px ${theme.palette.primary.main}25`,
                      },
                    }}
                  />
                </motion.div>
              ))}
            </Box>

            {/* Verify button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={!isComplete || isVerifying}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                mb: 3,
              }}
            >
              {isVerifying ? (
                <CircularProgress size={22} sx={{ color: "white" }} />
              ) : (
                "Verify Email"
              )}
            </Button>

            {/* Resend */}
            <Typography variant="body2" color="text.secondary">
              Didn&apos;t receive it?{" "}
              {cooldown > 0 ? (
                <Typography component="span" variant="body2" color="text.disabled">
                  Resend in {cooldown}s
                </Typography>
              ) : (
                <Typography
                  component="span"
                  variant="body2"
                  onClick={isResending ? undefined : handleResend}
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    cursor: isResending ? "default" : "pointer",
                    opacity: isResending ? 0.6 : 1,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {isResending ? "Sending…" : "Resend code"}
                </Typography>
              )}
            </Typography>

            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: "block", mt: 2 }}
            >
              Wrong email?{" "}
              <Typography
                component="span"
                variant="caption"
                onClick={() => router.push("/signup")}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Go back
              </Typography>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}