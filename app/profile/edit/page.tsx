// app/profile/edit/page.tsx
"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { MaterialPasswordField, MaterialTextField } from "@/components/common/CustomFields";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/features/user/userApiService";
import { setUser } from "@/features/auth/authSlice";
import { useToast } from "@/hooks/useToast";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  ArrowBackOutlined,
  Lock,
  PersonOutlined,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

// ── Password strength (reused from reset-password) ────────────────────────────
function getStrength(pw: string) {
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

// ── Schemas ───────────────────────────────────────────────────────────────────
const profileSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  phone: Yup.string().matches(/^[+\d\s\-()]{7,15}$/, "Enter a valid phone number").nullable(),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "At least one uppercase letter")
    .matches(/[0-9]/, "At least one number")
    .notOneOf([Yup.ref("currentPassword")], "New password must differ from current")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

// ── Tab panel ─────────────────────────────────────────────────────────────────
function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  return value === index ? (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  ) : null;
}

export default function ProfileEditPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(tabParam === "password" ? 1 : 0);

  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profile = data?.data;

  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  // ── Profile submit ────────────────────────────────────────────────────────
  const handleProfileSubmit = async (values: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    try {
      const result = await updateProfile(values).unwrap();
      dispatch(setUser(result.data));
      toast.showToast("Profile updated successfully!", "success");
      router.push("/profile");
    } catch (err: any) {
      toast.showToast(
        err?.data?.message ?? "Failed to update profile.",
        "error"
      );
    }
  };

  // ── Password submit ───────────────────────────────────────────────────────
  const handlePasswordSubmit = async (
    values: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    { resetForm }: any
  ) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.showToast("Password changed successfully!", "success");
      resetForm();
    } catch (err: any) {
      toast.showToast(
        err?.data?.message ?? "Failed to change password.",
        "error"
      );
    }
  };

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <>
      <Navbar />
      <main>
        {/* ── Header ── */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}12, ${
              theme.palette.background.accent ?? "#FFF8F7"
            })`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button
                startIcon={<ArrowBackOutlined />}
                onClick={() => router.push("/profile")}
                sx={{
                  mb: 2,
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    background: "transparent",
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Back to profile
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                {isLoading ? (
                  <Skeleton variant="circular" width={64} height={64} />
                ) : (
                  <Avatar
                    src={profile?.avatar}
                    sx={{
                      width: 64,
                      height: 64,
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
                        theme.palette.primary.dark ?? theme.palette.primary.main
                      })`,
                    }}
                  >
                    {initials}
                  </Avatar>
                )}
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      lineHeight: 1.15,
                    }}
                  >
                    Edit Profile
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Update your personal information and security settings
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1.5px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                px: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                },
              }}
            >
              <Tab
                label="Personal Info"
                icon={<PersonOutlined sx={{ fontSize: "1.1rem" }} />}
                iconPosition="start"
              />
              <Tab
                label="Change Password"
                icon={<Lock sx={{ fontSize: "1.1rem" }} />}
                iconPosition="start"
              />
            </Tabs>

            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {/* ── Tab 0: Personal Info ── */}
              <TabPanel value={tab} index={0}>
                {isLoading ? (
                  <Grid container spacing={2.5}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Skeleton height={56} sx={{ borderRadius: 1.5 }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Formik
                    initialValues={{
                      firstName: profile?.firstName ?? "",
                      lastName: profile?.lastName ?? "",
                      phone: profile?.phone ?? "",
                    }}
                    validationSchema={profileSchema}
                    onSubmit={handleProfileSubmit}
                    enableReinitialize
                  >
                    {({ isSubmitting, dirty }) => (
                      <Form>
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} sm={6}>
                            <MaterialTextField
                              label="First Name"
                              name="firstName"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonOutlined
                                      color="primary"
                                      sx={{ fontSize: "1.1rem" }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <MaterialTextField
                              label="Last Name"
                              name="lastName"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <MaterialTextField
                              label="Phone Number (Optional)"
                              name="phone"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneOutlined
                                      color="primary"
                                      sx={{ fontSize: "1.1rem" }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          {/* Email — read-only */}
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                px: 2,
                                py: 1.5,
                                borderRadius: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                                background: alpha(
                                  theme.palette.text.primary,
                                  0.03
                                ),
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.disabled }}
                              >
                                Email Address (cannot be changed)
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }}>
                                {profile?.email}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={() => router.push("/profile")}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={
                              !dirty || isSavingProfile || isSubmitting
                            }
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: "none",
                              minWidth: 130,
                            }}
                          >
                            {isSavingProfile || isSubmitting ? (
                              <CircularProgress size={20} sx={{ color: "white" }} />
                            ) : (
                              "Save changes"
                            )}
                          </Button>
                        </Box>
                      </Form>
                    )}
                  </Formik>
                )}
              </TabPanel>

              {/* ── Tab 1: Change Password ── */}
              <TabPanel value={tab} index={1}>
                <Formik
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validationSchema={passwordSchema}
                  onSubmit={handlePasswordSubmit}
                >
                  {({ isSubmitting, values }) => {
                    const strength = getStrength(values.newPassword);
                    return (
                      <Form>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            maxWidth: 460,
                          }}
                        >
                          <MaterialPasswordField
                            label="Current Password"
                            name="currentPassword"
                            type={showCurrent ? "text" : "password"}
                            startAdornment={
                              <InputAdornment position="start">
                                <Lock color="primary" sx={{ fontSize: "1.1rem" }} />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowCurrent((v) => !v)}
                                  edge="end"
                                  size="small"
                                >
                                  {showCurrent ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />

                          <Box>
                            <MaterialPasswordField
                              label="New Password"
                              name="newPassword"
                              type={showNew ? "text" : "password"}
                              startAdornment={
                                <InputAdornment position="start">
                                  <Lock color="primary" sx={{ fontSize: "1.1rem" }} />
                                </InputAdornment>
                              }
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowNew((v) => !v)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showNew ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              }
                            />

                            {values.newPassword && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                style={{ marginTop: 8 }}
                              >
                                <LinearProgress
                                  variant="determinate"
                                  value={strength.score}
                                  sx={{
                                    height: 5,
                                    borderRadius: 3,
                                    mb: 0.5,
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: strength.color,
                                      borderRadius: 3,
                                    },
                                    backgroundColor: "rgba(0,0,0,0.06)",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: strength.color, fontWeight: 600 }}
                                >
                                  {strength.label}
                                </Typography>
                              </motion.div>
                            )}
                          </Box>

                          <MaterialPasswordField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            startAdornment={
                              <InputAdornment position="start">
                                <Lock color="primary" sx={{ fontSize: "1.1rem" }} />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirm((v) => !v)}
                                  edge="end"
                                  size="small"
                                >
                                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                          <Button
                            variant="outlined"
                            onClick={() => setTab(0)}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isChangingPw || isSubmitting}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: "none",
                              minWidth: 150,
                            }}
                          >
                            {isChangingPw || isSubmitting ? (
                              <CircularProgress size={20} sx={{ color: "white" }} />
                            ) : (
                              "Update password"
                            )}
                          </Button>
                        </Box>
                      </Form>
                    );
                  }}
                </Formik>
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </main>
      <Footer />
    </>
  );
}