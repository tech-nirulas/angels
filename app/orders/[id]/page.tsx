// app/orders/[id]/page.tsx
"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import {
  // useCancelOrderMutation,
  // useCreateComplaintMutation,
  // useCreateReviewMutation,
  useGetOrderQuery,
} from "@/features/order/orderApiService";
import { useAppSelector } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// ── Re-use status config ──────────────────────────────────────────────────────
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

// Order progress steps
const ORDER_STEPS = [
  { key: "confirmed", label: "Order Confirmed" },
  { key: "processing", label: "Being Prepared" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const COMPLAINT_TYPES = [
  { value: "WRONG_ITEM", label: "Wrong item received" },
  { value: "DAMAGED", label: "Item was damaged" },
  { value: "MISSING_ITEM", label: "Item missing from order" },
  { value: "LATE_DELIVERY", label: "Late delivery" },
  { value: "QUALITY", label: "Quality issue" },
  { value: "OTHER", label: "Other" },
];

// ── Star rating input ─────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          sx={{ cursor: "pointer", fontSize: "2rem", color: star <= (hover || value) ? "#F59E0B" : "#D1D5DB", transition: "color 0.1s" }}
        >
          {star <= (hover || value) ? <StarIcon fontSize="inherit" /> : <StarBorderIcon fontSize="inherit" />}
        </Box>
      ))}
    </Box>
  );
}

// ── Review dialog ─────────────────────────────────────────────────────────────
function ReviewDialog({
  open,
  onClose,
  orderId,
  item,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  item: any;
  onSuccess: () => void;
}) {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  // const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async () => {
    if (!rating) return;
    try {
      await createReview({ orderId, productId: item.productId, rating, comment }).unwrap();
      onSuccess();
      onClose();
    } catch { }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 700, borderBottom: `1px solid ${theme.palette.divider}` }}>
        Review Product
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, overflow: "hidden", bgcolor: alpha(theme.palette.primary.main, 0.08), flexShrink: 0 }}>
            <Image
              src={item?.productSnapshot?.image ? MEDIA_BASE_URL + item.productSnapshot.image : "https://placehold.co/80x80?text=🥐"}
              width={56} height={56} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {item?.productSnapshot?.name}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Your rating</Typography>
        <StarRating value={rating} onChange={setRating} />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          // disabled={!rating || isLoading}
          sx={{ borderRadius: 2, textTransform: "none", minWidth: 120 }}
        >
          {/* {isLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Submit Review"} */}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Complaint dialog ──────────────────────────────────────────────────────────
function ComplaintDialog({
  open,
  onClose,
  orderId,
  items,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  items: any[];
  onSuccess: () => void;
}) {
  const theme = useTheme();
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [orderItemId, setOrderItemId] = useState("");
  // const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const handleSubmit = async () => {
    if (!type || !description) return;
    try {
      // await createComplaint({ orderId, type, description, orderItemId: orderItemId || undefined }).unwrap();
      onSuccess();
      onClose();
    } catch { }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 700, borderBottom: `1px solid ${theme.palette.divider}` }}>
        Report an Issue
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            fullWidth
            label="Issue type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          >
            {COMPLAINT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>

          {items.length > 1 && (
            <TextField
              select
              fullWidth
              label="Which item? (optional)"
              value={orderItemId}
              onChange={(e) => setOrderItemId(e.target.value)}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="">All items</MenuItem>
              {items.map((item: any) => (
                <MenuItem key={item.id} value={item.id}>{item.productSnapshot?.name}</MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          // disabled={!type || !description || isLoading}
          sx={{ borderRadius: 2, textTransform: "none", minWidth: 120 }}
        >
          {/* {isLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Submit"} */}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Cancel confirm dialog ─────────────────────────────────────────────────────
function CancelDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Cancel Order?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Your order will be cancelled and a refund will be initiated if payment was made. This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>Keep Order</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isLoading} sx={{ borderRadius: 2, textTransform: "none" }}>
          {isLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Yes, Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Order progress tracker ────────────────────────────────────────────────────
function OrderProgress({ status }: { status: string }) {
  const theme = useTheme();
  const isCancelled = ["cancelled", "payment_failed", "refunded"].includes(status);
  const currentStep = ORDER_STEPS.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, borderRadius: 2, bgcolor: "#FEE2E2" }}>
        <CancelOutlinedIcon sx={{ color: "#991B1B" }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#991B1B" }}>
          {STATUS_CONFIG[status]?.label ?? status}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      {/* Progress line */}
      <Box sx={{ position: "absolute", top: 16, left: 16, right: 16, height: 2, bgcolor: theme.palette.divider, zIndex: 0 }} />
      <Box
        sx={{
          position: "absolute", top: 16, left: 16, height: 2, zIndex: 1,
          bgcolor: theme.palette.primary.main,
          width: currentStep < 0 ? "0%" : `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%`,
          transition: "width 0.5s ease",
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        {ORDER_STEPS.map((step, idx) => {
          const done = currentStep >= idx;
          return (
            <Box key={step.key} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, flex: 1 }}>
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: "50%",
                  bgcolor: done ? theme.palette.primary.main : theme.palette.background.paper,
                  border: `2px solid ${done ? theme.palette.primary.main : theme.palette.divider}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                {done && <CheckCircleOutlinedIcon sx={{ fontSize: "1rem", color: "white" }} />}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: done ? 700 : 400,
                  color: done ? theme.palette.primary.main : theme.palette.text.disabled,
                  textAlign: "center",
                  fontSize: "0.65rem",
                  lineHeight: 1.3,
                  maxWidth: 70,
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data, isLoading, refetch } = useGetOrderQuery({ id: orderId }, { skip: !isAuthenticated });
  const order = data?.data ?? data;

  // const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [reviewItem, setReviewItem] = useState<any>(null);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });
  const [copied, setCopied] = useState(false);

  const showSnack = (msg: string, severity: "success" | "error" = "success") =>
    setSnack({ open: true, msg, severity });

  const handleCopy = () => {
    navigator.clipboard.writeText(order?.orderNumber ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    try {
      // await cancelOrder(orderId).unwrap();
      setCancelOpen(false);
      showSnack("Order cancelled. Refund will be initiated shortly.");
      refetch();
    } catch {
      showSnack("Failed to cancel order.", "error");
    }
  };

  const canCancel = order && ["pending", "confirmed"].includes(order.status);
  const canReview = order && ["delivered", "completed"].includes(order.status);
  const canComplain = order && !["pending", "payment_failed"].includes(order.status);

  const payment = order?.payments?.[0];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Container>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h5">Order not found</Typography>
          <Button onClick={() => router.push("/orders")} sx={{ mt: 2 }}>Back to orders</Button>
        </Container>
        <Footer />
      </>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "#374151", bg: "#F3F4F6" };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}12, ${theme.palette.background.accent})`, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, py: { xs: 3, md: 5 } }}>
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/orders")} sx={{ mb: 2, color: theme.palette.text.secondary, fontSize: "0.8rem", "&:hover": { background: "transparent", color: theme.palette.primary.main } }}>
                Back to Orders
              </Button>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                    <Typography variant="h4" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1.1 }}>
                      {order.orderNumber}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy order number"}>
                      <ContentCopyIcon
                        onClick={handleCopy}
                        sx={{ fontSize: "1rem", color: theme.palette.text.disabled, cursor: "pointer", "&:hover": { color: theme.palette.primary.main } }}
                      />
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Placed on {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Chip label={cfg.label} sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, border: `1px solid ${cfg.color}30` }} />
                  {canCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={() => setCancelOpen(true)}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          <Grid container spacing={3}>
            {/* ── Left column ── */}
            <Grid item xs={12} md={8}>
              {/* Order progress */}
              {!["cancelled", "payment_failed", "refunded"].includes(order.status) && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${theme.palette.divider}`, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 3 }}>
                      Order Progress
                    </Typography>
                    <OrderProgress status={order.status} />
                  </Paper>
                </motion.div>
              )}

              {/* Items */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${theme.palette.divider}`, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 2.5 }}>
                    Order Items ({order.items?.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {order.items?.map((item: any) => {
                      const unitPrice = Number(item.unitPrice);
                      const lineTotal = Number(item.lineTotal);
                      return (
                        <Box key={item.id}>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <Box sx={{ width: 64, height: 64, borderRadius: 2, overflow: "hidden", bgcolor: alpha(theme.palette.primary.main, 0.06), flexShrink: 0 }}>
                              <Image
                                src={item.productSnapshot?.image ? MEDIA_BASE_URL + item.productSnapshot.image : "https://placehold.co/80x80?text=🥐"}
                                width={64} height={64} alt={item.productSnapshot?.name ?? ""}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                {item.productSnapshot?.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                ₹{unitPrice.toFixed(2)} × {item.quantity}
                                {item.productSnapshot?.discount && (
                                  <Typography component="span" sx={{ ml: 0.5, color: theme.palette.success.main, fontSize: "inherit" }}>
                                    ({item.productSnapshot.discount}% off)
                                  </Typography>
                                )}
                              </Typography>
                              {item.gstRate > 0 && (
                                <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: "block" }}>
                                  GST {item.gstRate}%{item.hsnCode && ` · HSN ${item.hsnCode}`}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "var(--font-display)", flexShrink: 0 }}>
                              ₹{lineTotal.toFixed(2)}
                            </Typography>
                          </Box>

                          {/* Review button */}
                          {canReview && (
                            <Button
                              size="small"
                              startIcon={<StarBorderIcon fontSize="small" />}
                              onClick={() => setReviewItem(item)}
                              sx={{ mt: 1, ml: 9, textTransform: "none", fontSize: "0.75rem", color: theme.palette.primary.main }}
                            >
                              Write a review
                            </Button>
                          )}
                          <Divider sx={{ mt: 2 }} />
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              </motion.div>

              {/* Delivery address */}
              {order.deliveryAddress && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${theme.palette.divider}`, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                      <HomeOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                        Delivery Address
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                      {order.deliveryAddress.label} · {order.deliveryAddress.recipientName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                      {order.deliveryAddress.line1}
                      {order.deliveryAddress.line2 && `, ${order.deliveryAddress.line2}`}
                      <br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.postcode}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                      📞 {order.deliveryAddress.phone}
                    </Typography>
                    {order.deliveryInstructions && (
                      <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: theme.palette.text.disabled, fontStyle: "italic" }}>
                        📝 {order.deliveryInstructions}
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              )}

              {/* Actions */}
              {(canComplain) && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 2 }}>
                      Need help?
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      <Button
                        variant="outlined"
                        startIcon={<ReportProblemOutlinedIcon />}
                        onClick={() => setComplaintOpen(true)}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                      >
                        Report an Issue
                      </Button>
                      {canCancel && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelOutlinedIcon />}
                          onClick={() => setCancelOpen(true)}
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              )}
            </Grid>

            {/* ── Right column — financials + payment ── */}
            <Grid item xs={12} md={4}>
              {/* Order summary */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${theme.palette.divider}`, mb: 3, position: { md: "sticky" }, top: { md: 100 } }}>
                  <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 2.5 }}>
                    Price Breakdown
                  </Typography>

                  {[
                    { label: "Subtotal", value: Number(order.subtotal) },
                    { label: "GST", value: Number(order.gstAmount) },
                    { label: "Delivery fee", value: Number(order.deliveryFee) },
                    ...(order.promoDiscount ? [{ label: `Promo (${order.promoCode})`, value: -Number(order.promoDiscount) }] : []),
                    ...(order.discountTotal > 0 && !order.promoDiscount ? [{ label: "Discount", value: -Number(order.discountTotal) }] : []),
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: value < 0 ? theme.palette.success.main : "inherit" }}>
                        {value < 0 ? "−" : ""}₹{Math.abs(value).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                    <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 800, color: theme.palette.primary.main }}>
                      ₹{Number(order.grandTotal).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Tax breakdown */}
                  {order.cgstAmount > 0 && (
                    <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: "block", mb: 0.5, fontWeight: 600 }}>
                        Tax Breakdown
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>CGST</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>₹{Number(order.cgstAmount).toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>SGST</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>₹{Number(order.sgstAmount).toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </motion.div>

              {/* Payment info */}
              {payment && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1.5px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                      <PaymentOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                        Payment
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>Status</Typography>
                        <Chip
                          label={payment.status}
                          size="small"
                          sx={{
                            height: 20, fontSize: "0.6rem", fontWeight: 700,
                            bgcolor: payment.status === "CAPTURED" ? "#D1FAE5" : payment.status === "FAILED" ? "#FEE2E2" : "#FEF3C7",
                            color: payment.status === "CAPTURED" ? "#065F46" : payment.status === "FAILED" ? "#991B1B" : "#92400E",
                          }}
                        />
                      </Box>

                      {payment.method && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>Method</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "capitalize" }}>{payment.method}</Typography>
                        </Box>
                      )}

                      {payment.vpa && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>UPI ID</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{payment.vpa}</Typography>
                        </Box>
                      )}

                      {payment.bank && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>Bank</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{payment.bank}</Typography>
                        </Box>
                      )}

                      {payment.razorpayPaymentId && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>Transaction ID</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}>
                              {payment.razorpayPaymentId}
                            </Typography>
                            <ContentCopyIcon
                              sx={{ fontSize: "0.75rem", cursor: "pointer", color: theme.palette.text.disabled, "&:hover": { color: theme.palette.primary.main } }}
                              onClick={() => navigator.clipboard.writeText(payment.razorpayPaymentId)}
                            />
                          </Box>
                        </Box>
                      )}

                      {payment.capturedAt && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>Paid on</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {new Date(payment.capturedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </Typography>
                        </Box>
                      )}

                      {payment.status === "REFUNDED" && (
                        <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: "#D1FAE5" }}>
                          <Typography variant="caption" sx={{ color: "#065F46", fontWeight: 600 }}>
                            ✓ Refund of ₹{Number(payment.refundAmount ?? order.grandTotal).toFixed(2)} initiated
                          </Typography>
                          {payment.refundedAt && (
                            <Typography variant="caption" sx={{ color: "#065F46", display: "block" }}>
                              on {new Date(payment.refundedAt).toLocaleDateString("en-IN")}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {payment.errorDescription && (
                        <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: "#FEE2E2" }}>
                          <Typography variant="caption" sx={{ color: "#991B1B" }}>
                            {payment.errorDescription}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              )}
            </Grid>
          </Grid>
        </Container>
      </main>

      <Footer />

      {/* ── Dialogs ── */}
      {reviewItem && (
        <ReviewDialog
          open={!!reviewItem}
          onClose={() => setReviewItem(null)}
          orderId={orderId}
          item={reviewItem}
          onSuccess={() => showSnack("Review submitted! Thank you.")}
        />
      )}

      <ComplaintDialog
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        orderId={orderId}
        items={order.items ?? []}
        onSuccess={() => showSnack("Issue reported. Our team will contact you shortly.")}
      />

      <CancelDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        // isLoading={isCancelling}
      />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}