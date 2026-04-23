// app/profile/page.tsx
"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useGetProfileQuery } from "@/features/user/userApiService";
import { logout } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  AccountCircleOutlined,
  EditOutlined,
  EmailOutlined,
  LocalShippingOutlined,
  LogoutOutlined,
  PhoneOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      <Box sx={{ color: alpha(theme.palette.primary.main, 0.7), flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: "block" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
          {value || <span style={{ color: theme.palette.text.disabled }}>Not provided</span>}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}) {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1.5px solid ${theme.palette.divider}`,
          textAlign: "center",
          transition: "all 0.25s ease",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <Box sx={{ color: theme.palette.primary.main, mb: 1 }}>{icon}</Box>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 0.25 }}
        >
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {label}
        </Typography>
      </Paper>
    </motion.div>
  );
}

export default function ProfilePage() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profile = data?.data;

  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "";

  const initials = fullName
    ? fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}12, ${theme.palette.background.accent ?? "#FFF8F7"})`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            py: { xs: 5, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                {/* Avatar */}
                {isLoading ? (
                  <Skeleton variant="circular" width={88} height={88} />
                ) : (
                  <Avatar
                    src={profile?.avatar}
                    sx={{
                      width: 88,
                      height: 88,
                      fontSize: "2rem",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    {initials}
                  </Avatar>
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {isLoading ? (
                    <>
                      <Skeleton width={200} height={36} sx={{ mb: 0.5 }} />
                      <Skeleton width={140} height={20} />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          lineHeight: 1.1,
                        }}
                      >
                        {fullName || "My Profile"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {profile?.email}
                        </Typography>
                        {profile?.role?.name && (
                          <Chip
                            label={profile.role.name}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                        )}
                      </Box>
                    </>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditOutlined />}
                    onClick={() => router.push("/profile/edit")}
                    sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LogoutOutlined />}
                    onClick={handleLogout}
                    color="error"
                    sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
                  >
                    Sign Out
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4}>
            {/* ── Personal info card ── */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1.5px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <AccountCircleOutlined sx={{ color: theme.palette.primary.main }} />
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                      Personal Info
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 1 }} />

                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Box key={i} sx={{ py: 1.5 }}>
                        <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
                        <Skeleton width="70%" height={18} />
                      </Box>
                    ))
                  ) : (
                    <>
                      <InfoRow
                        icon={<AccountCircleOutlined fontSize="small" />}
                        label="Full Name"
                        value={fullName}
                      />
                      <Divider />
                      <InfoRow
                        icon={<EmailOutlined fontSize="small" />}
                        label="Email Address"
                        value={profile?.email}
                      />
                      <Divider />
                      <InfoRow
                        icon={<PhoneOutlined fontSize="small" />}
                        label="Phone Number"
                        value={profile?.phone}
                      />
                    </>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => router.push("/profile/edit?tab=password")}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* ── Stats + orders ── */}
            <Grid item xs={12} md={7}>
              {/* Stats row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                  <StatCard
                    icon={<ShoppingBagOutlined />}
                    label="Total Orders"
                    value={profile?.customer?.totalOrders ?? 0}
                    delay={0.15}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <StatCard
                    icon={<LocalShippingOutlined />}
                    label="Delivered"
                    value={profile?.customer?.deliveredOrders ?? 0}
                    delay={0.2}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StatCard
                    icon={<span style={{ fontSize: "1.25rem" }}>₹</span>}
                    label="Total Spent"
                    value={`₹${(profile?.customer?.totalSpent ?? 0).toLocaleString()}`}
                    delay={0.25}
                  />
                </Grid>
              </Grid>

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1.5px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[
                      {
                        label: "View my orders",
                        icon: <ShoppingBagOutlined fontSize="small" />,
                        href: "/orders",
                      },
                      {
                        label: "Edit profile",
                        icon: <EditOutlined fontSize="small" />,
                        href: "/profile/edit",
                      },
                      {
                        label: "Manage addresses",
                        icon: <LocalShippingOutlined fontSize="small" />,
                        href: "/profile/edit?tab=address",
                      },
                    ].map((item) => (
                      <Button
                        key={item.href}
                        fullWidth
                        variant="outlined"
                        startIcon={item.icon}
                        onClick={() => router.push(item.href)}
                        sx={{
                          justifyContent: "flex-start",
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          borderColor: theme.palette.divider,
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </main>
      <Footer />
    </>
  );
}