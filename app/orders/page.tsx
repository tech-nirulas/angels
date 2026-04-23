// app/orders/page.tsx
"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useGetOrdersPaginatedQuery } from "@/features/order/orderApiService";
import { useAppSelector } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#B45309", bg: "#FEF3C7" },
  confirmed: { label: "Confirmed", color: "#1D4ED8", bg: "#DBEAFE" },
  processing: { label: "Processing", color: "#6D28D9", bg: "#EDE9FE" },
  ready: { label: "Ready", color: "#047857", bg: "#D1FAE5" },
  out_for_delivery: { label: "Out for Delivery", color: "#0369A1", bg: "#E0F2FE" },
  delivered: { label: "Delivered", color: "#065F46", bg: "#D1FAE5" },
  cancelled: { label: "Cancelled", color: "#991B1B", bg: "#FEE2E2" },
  payment_failed: { label: "Payment Failed", color: "#991B1B", bg: "#FEE2E2" },
  refunded: { label: "Refunded", color: "#6B7280", bg: "#F3F4F6" },
};

function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#374151", bg: "#F3F4F6" };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.7rem", border: `1px solid ${cfg.color}30` }}
    />
  );
}

function OrderCard({ order }: { order: any }) {
  const theme = useTheme();
  const router = useRouter();
  const firstItem = order.items?.[0];
  const totalItems = order.items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1.5px solid ${theme.palette.divider}`,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {order.orderNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StatusChip status={order.status} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: "var(--font-display)" }}>
              ₹{Number(order.grandTotal).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Items preview */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {/* Stacked thumbnails */}
          <Box sx={{ display: "flex", position: "relative", width: 80 }}>
            {order.items?.slice(0, 3).map((item: any, idx: number) => (
              <Box
                key={item.id}
                sx={{
                  width: 40, height: 40, borderRadius: 1.5,
                  overflow: "hidden", border: `2px solid white`,
                  position: idx === 0 ? "relative" : "absolute",
                  left: idx * 16, zIndex: 3 - idx,
                  flexShrink: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <Image
                  src={item.productSnapshot?.image ? MEDIA_BASE_URL + item.productSnapshot.image : "https://placehold.co/80x80?text=🥐"}
                  width={40} height={40} alt={item.productSnapshot?.name ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {firstItem?.productSnapshot?.name}
              {order.items?.length > 1 && (
                <Typography component="span" variant="caption" sx={{ color: theme.palette.text.disabled, ml: 0.5 }}>
                  +{order.items.length - 1} more
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {totalItems} item{totalItems !== 1 ? "s" : ""} · {order.orderType}
            </Typography>
          </Box>
        </Box>

        {/* Delivery address */}
        {order.deliveryAddress && (
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: "block", mb: 2 }}>
            📍 {order.deliveryAddress.line1}, {order.deliveryAddress.city}
          </Typography>
        )}

        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => router.push(`/orders/${order.id}`)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          View Order Details
        </Button>
      </Paper>
    </motion.div>
  );
}

export default function OrdersPage() {
  const theme = useTheme();
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetOrdersPaginatedQuery(
    {
      page,
      limit: 10,
      sortBy: "placedAt",
      sortOrder: "desc",
    },
    { skip: !isAuthenticated }
  );

  const orders = data?.data ?? data ?? [];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}12, ${theme.palette.background.accent})`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: alpha(theme.palette.primary.main, 0.1), display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.primary.main }}>
                  <ReceiptLongOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1.1 }}>
                    My Orders
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                    {isLoading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: "center", py: { xs: 8, md: 12 } }}>
              <Box sx={{ width: 96, height: 96, borderRadius: "50%", bgcolor: alpha(theme.palette.primary.main, 0.08), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: "2.5rem", color: theme.palette.primary.main, opacity: 0.5 }} />
              </Box>
              <Typography variant="h5" sx={{ fontFamily: "var(--font-display)", fontWeight: 600, mb: 1 }}>
                No orders yet
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                When you place orders, they will appear here.
              </Typography>
              <Button variant="contained" size="large" onClick={() => router.push("/menu")} sx={{ borderRadius: 3, px: 4, py: 1.5, textTransform: "none", fontWeight: 600 }}>
                Browse the Menu
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              disabled={orders.length < 10}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Box>
        </Container>

      </main>
      <Footer />
    </>
  );
}