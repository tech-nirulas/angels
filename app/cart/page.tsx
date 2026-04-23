// app/cart/page.tsx
"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import LoginModal from "@/components/ui/LoginModal";
import { useGetAddressesQuery } from "@/features/address/addressApiService";
import {
  useClearCartMutation,
  useGetCartQuery,
  useMergeCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
} from "@/features/cart/cartApiService";
import {
  clearGuestCart,
  removeFromGuestCart,
  selectGuestCartItems,
  selectGuestCartTotal,
  updateGuestQuantity,
} from "@/features/cart/cartSlice";
import { useCreateOrderMutation, useVerifyPaymentMutation } from "@/features/order/orderApiService";
import { Address } from "@/interfaces/address.interface";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
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
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function effectivePrice(price: number, discount?: number | null) {
  if (discount && discount > 0) return price * (1 - discount / 100);
  return price;
}

function AddressTypeIcon({ type }: { type: string }) {
  if (type === "HOME") return <HomeOutlinedIcon fontSize="small" />;
  if (type === "WORK") return <BusinessOutlinedIcon fontSize="small" />;
  return <LocationOnOutlinedIcon fontSize="small" />;
}

// ── QuantityStepper ───────────────────────────────────────────────────────────
function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  disabled,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: `1.5px solid ${theme.palette.divider}`,
        borderRadius: "10px",
        overflow: "hidden",
        width: "fit-content",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <IconButton
        size="small"
        onClick={onDecrement}
        disabled={disabled}
        sx={{
          borderRadius: 0,
          width: 32,
          height: 32,
          "&:hover": { background: alpha(theme.palette.primary.main, 0.08) },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1 }}>−</Typography>
      </IconButton>
      <Typography
        sx={{ width: 36, textAlign: "center", fontWeight: 600, fontSize: "0.9rem", userSelect: "none" }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={onIncrement}
        disabled={disabled}
        sx={{
          borderRadius: 0,
          width: 32,
          height: 32,
          "&:hover": { background: alpha(theme.palette.primary.main, 0.08) },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1 }}>+</Typography>
      </IconButton>
    </Box>
  );
}

// ── Address selector card ────────────────────────────────────────────────────
function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <Paper
      onClick={onSelect}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        cursor: "pointer",
        background: selected ? alpha(theme.palette.primary.main, 0.04) : "white",
        transition: "all 0.2s ease",
        "&:hover": { borderColor: theme.palette.primary.main },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            mt: 0.25,
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          <AddressTypeIcon type={address.addressType} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {address.label}
            </Typography>
            {address.isDefault && (
              <Chip
                label="Default"
                size="small"
                sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: theme.palette.primary.main, color: "white" }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5, display: "block" }}>
            {address.line1}{address.line2 ? `, ${address.line2}` : ""}
            <br />
            {address.city}, {address.state} — {address.postcode}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
            {address.recipientName} · {address.phone}
          </Typography>
        </Box>
        {selected && (
          <CheckCircleIcon sx={{ color: theme.palette.primary.main, flexShrink: 0 }} />
        )}
      </Box>
    </Paper>
  );
}

// ── Delivery Confirmation Modal ───────────────────────────────────────────────
function DeliveryConfirmModal({
  open,
  onClose,
  onConfirm,
  addresses,
  selectedAddressId,
  onSelectAddress,
  orderTotal,
  isPlacingOrder,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  orderTotal: number;
  isPlacingOrder: boolean;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        Confirm Delivery Address
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {addresses.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <LocationOnOutlinedIcon
              sx={{ fontSize: "3rem", color: theme.palette.text.disabled, mb: 1 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              No saved addresses
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Add a delivery address to continue
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => router.push("/addresses")}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Add Address
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Select where you want your order delivered:
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  selected={selectedAddressId === addr.id}
                  onSelect={() => onSelectAddress(addr.id)}
                />
              ))}
            </Box>

            <Button
              size="small"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={() => router.push("/addresses")}
              sx={{ textTransform: "none", color: theme.palette.primary.main, mb: 1 }}
            >
              Manage addresses
            </Button>

            <Divider sx={{ my: 2 }} />

            {/* Order total summary */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Order total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                  }}
                >
                  ₹{orderTotal.toFixed(2)}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.disabled, display: "block", mt: 0.5 }}
              >
                You will be redirected to Razorpay to complete payment
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      {addresses.length > 0 && (
        <DialogActions
          sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, gap: 1 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            disabled={!selectedAddressId || isPlacingOrder}
            sx={{ borderRadius: 2, textTransform: "none", minWidth: 140 }}
          >
            {isPlacingOrder ? (
              <CircularProgress size={18} sx={{ color: "white" }} />
            ) : (
              "Pay ₹" + orderTotal.toFixed(2)
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CartPage() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const guestItems = useAppSelector(selectGuestCartItems);
  const guestTotal = useAppSelector(selectGuestCartTotal);

  const {
    data: serverItems,
    isLoading: serverCartLoading,
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  const [updateQuantityMutation] = useUpdateCartQuantityMutation();
  const [removeItemMutation] = useRemoveFromCartMutation();
  const [clearCartMutation] = useClearCartMutation();
  const [mergeCartMutation] = useMergeCartMutation();

  // Addresses
  const { data: addressesData } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const addresses = addressesData?.data ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  const normalizedItems = isAuthenticated ? serverItems?.data || [] : guestItems;
  const cartTotal = isAuthenticated
    ? normalizedItems.reduce((s, i) => s + Number(i.lineTotal), 0)
    : guestTotal;

  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"info" | "success" | "error">("info");
  const [removedName, setRemovedName] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 49;
  const PROMO_DISCOUNT = 0.1;
  const VALID_PROMO = "BAKERY10";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (defaultAddress) setSelectedAddressId(defaultAddress.id);
  }, [defaultAddress]);

  useEffect(() => {
    if (isAuthenticated && guestItems.length > 0) {
      mergeCartMutation({
        items: guestItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }).then(() => dispatch(clearGuestCart()));
    }
  }, [isAuthenticated]);

  const shipping = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const promoSaving = promoApplied ? cartTotal * PROMO_DISCOUNT : 0;
  const orderTotal = cartTotal - promoSaving + shipping;
  const shippingProgress = Math.min((cartTotal / SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(SHIPPING_THRESHOLD - cartTotal, 0);

  const showSnack = (msg: string, severity: "info" | "success" | "error" = "info") => {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
    } else {
      setDeliveryModalOpen(true);
    }
  };

  // ── Razorpay payment flow ────────────────────────────────────────────────
  const handleConfirmAndPay = async () => {
    if (!selectedAddressId) return;
    setIsPlacingOrder(true);

    try {
      // 1. Create order on backend
      const res = await createOrder({
        orderType: "delivery",
        deliveryAddressId: selectedAddressId,
        promoCode: promoApplied ? VALID_PROMO : undefined,
      }).unwrap();

      const { razorpayOrderId, amount, currency, keyId, order } = res.data;

      // 2. Open Razorpay checkout
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      const options = {
        key: keyId,
        amount,
        currency,
        name: "Angels in My Kitchen",
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: selectedAddress?.recipientName ?? "",
          contact: selectedAddress?.phone ?? "",
        },
        theme: { color: "#A03A5A" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Verify on backend
          const verifyRes = await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })

          setDeliveryModalOpen(false);
          showSnack("Payment successful! Redirecting to your order...", "success");
          setTimeout(() => router.push(`/orders/${order.id}`), 1500);
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
          },
        },
      };

      // @ts-ignore — Razorpay loaded via script tag
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        showSnack("Payment failed. Please try again.", "error");
        setIsPlacingOrder(false);
      });
      rzp.open();
      setDeliveryModalOpen(false);
    } catch {
      showSnack("Something went wrong. Please try again.", "error");
      setIsPlacingOrder(false);
    }
  };

  const handleUpdateQuantity = useCallback(
    async (productId: string, newQuantity: number) => {
      setUpdatingProductId(productId);
      if (isAuthenticated) {
        if (newQuantity <= 0) await removeItemMutation(productId);
        else await updateQuantityMutation({ productId, quantity: newQuantity });
      } else {
        dispatch(updateGuestQuantity({ productId, quantity: newQuantity }));
      }
      setUpdatingProductId(null);
    },
    [dispatch, isAuthenticated, updateQuantityMutation, removeItemMutation]
  );

  const handleRemove = useCallback(
    async (productId: string, productName: string) => {
      setUpdatingProductId(productId);
      if (isAuthenticated) await removeItemMutation(productId);
      else dispatch(removeFromGuestCart(productId));
      setRemovedName(productName);
      showSnack(`${productName} removed`, "info");
      setUpdatingProductId(null);
    },
    [dispatch, isAuthenticated, removeItemMutation]
  );

  const handleClearCart = useCallback(async () => {
    if (isAuthenticated) await clearCartMutation();
    else dispatch(clearGuestCart());
  }, [dispatch, isAuthenticated, clearCartMutation]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === VALID_PROMO) {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  const isPageLoading = !mounted || (isAuthenticated && serverCartLoading);

  if (isPageLoading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero strip ── */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}12, ${theme.palette.background.accent})`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/menu")}
                sx={{ mb: 2, color: theme.palette.text.secondary, fontSize: "0.8rem", "&:hover": { background: "transparent", color: theme.palette.primary.main } }}
              >
                Continue Shopping
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ShoppingBagOutlinedIcon sx={{ fontSize: "2rem", color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="h3" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.8rem", md: "2.4rem" }, fontWeight: 700, lineHeight: 1.1 }}>
                    Your Cart
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                    {normalizedItems.length === 0
                      ? "Your cart is empty"
                      : `${normalizedItems.reduce((s, i) => s + i.quantity, 0)} items ready to order`}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {normalizedItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Box sx={{ textAlign: "center", py: { xs: 8, md: 14 }, px: 2 }}>
                <Box sx={{ width: 100, height: 100, borderRadius: "50%", background: alpha(theme.palette.primary.main, 0.08), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                  <ShoppingBagOutlinedIcon sx={{ fontSize: "2.8rem", color: theme.palette.primary.main, opacity: 0.6 }} />
                </Box>
                <Typography variant="h4" sx={{ fontFamily: "var(--font-display)", fontWeight: 600, mb: 1.5 }}>Nothing here yet</Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 360, mx: "auto" }}>
                  Looks like you haven&apos;t added anything to your cart.
                </Typography>
                <Button variant="contained" size="large" onClick={() => router.push("/menu")} sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: 600 }}>
                  Browse the Menu
                </Button>
              </Box>
            </motion.div>
          ) : (
            <Grid container spacing={{ xs: 3, md: 5 }}>
              {/* ── Cart items ── */}
              <Grid item xs={12} md={7}>
                {/* Shipping progress */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Box sx={{ mb: 3, p: 2.5, borderRadius: 3, border: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`, background: alpha(theme.palette.primary.main, 0.03) }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: "1.1rem", color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {shipping === 0 ? "🎉 You've unlocked free delivery!" : `Add ₹${remaining.toFixed(0)} more for free delivery`}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 3, background: alpha(theme.palette.primary.main, 0.12), overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 3, background: theme.palette.primary.main }}
                      />
                    </Box>
                  </Box>
                </motion.div>

                {/* Items */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <AnimatePresence mode="popLayout">
                    {normalizedItems.map((item, idx) => {
                      const unitPrice = effectivePrice(Number(item.currentPrice), item.currentDiscount ? Number(item.currentDiscount) : null);
                      const lineTotal = unitPrice * item.quantity;
                      const isItemUpdating = updatingProductId === item.productId;

                      return (
                        <motion.div
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2.5,
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: 3,
                              border: `1.5px solid ${theme.palette.divider}`,
                              background: theme.palette.background.paper,
                              opacity: isItemUpdating ? 0.6 : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            <Box sx={{ flexShrink: 0, width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 }, borderRadius: 2, overflow: "hidden", bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                              <Image
                                src={item.product.mainImage?.key ? MEDIA_BASE_URL + item.product.mainImage.key : "https://placehold.co/200x200?text=🥐"}
                                width={200} height={200} alt={item.product.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle1" sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: { xs: "0.9rem", sm: "1rem" }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {item.product.name}
                                  </Typography>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                    <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main, fontSize: "0.95rem", fontFamily: "var(--font-display)" }}>
                                      ₹{unitPrice.toFixed(2)}
                                    </Typography>
                                    {item.currentDiscount && item.currentDiscount > 0 && (
                                      <>
                                        <Typography variant="caption" sx={{ textDecoration: "line-through", color: theme.palette.text.disabled }}>
                                          ₹{Number(item.currentPrice).toFixed(2)}
                                        </Typography>
                                        <Chip label={`-${item.currentDiscount}%`} size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, background: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }} />
                                      </>
                                    )}
                                  </Box>
                                </Box>
                                <Tooltip title="Remove item">
                                  <IconButton size="small" onClick={() => handleRemove(item.productId, item.product.name)} disabled={isItemUpdating} sx={{ flexShrink: 0, color: theme.palette.text.disabled, "&:hover": { color: theme.palette.error.main, background: alpha(theme.palette.error.main, 0.08) } }}>
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
                                <QuantityStepper
                                  value={item.quantity}
                                  onDecrement={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                  onIncrement={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                  disabled={isItemUpdating}
                                />
                                <Typography sx={{ fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-display)" }}>
                                  ₹{lineTotal.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Box>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button size="small" onClick={handleClearCart} sx={{ color: theme.palette.text.disabled, fontSize: "0.75rem", "&:hover": { color: theme.palette.error.main, background: "transparent" } }}>
                    Clear entire cart
                  </Button>
                </Box>

                {/* Default address preview (when logged in) */}
                {isAuthenticated && defaultAddress && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2.5,
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        background: alpha(theme.palette.primary.main, 0.03),
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <LocalShippingOutlinedIcon sx={{ color: theme.palette.primary.main, mt: 0.25, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                          Delivering to: {defaultAddress.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {defaultAddress.line1}, {defaultAddress.city}, {defaultAddress.state} — {defaultAddress.postcode}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => setDeliveryModalOpen(true)}
                        sx={{ textTransform: "none", fontSize: "0.75rem", flexShrink: 0 }}
                      >
                        Change
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </Grid>

              {/* ── Order summary ── */}
              <Grid item xs={12} md={5}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                  <Box sx={{ borderRadius: 4, border: `1.5px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3, position: { md: "sticky" }, top: { md: 100 } }}>
                    <Typography variant="h5" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mb: 3, fontSize: "1.3rem" }}>
                      Order Summary
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Subtotal ({normalizedItems.reduce((s, i) => s + i.quantity, 0)} items)
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{cartTotal.toFixed(2)}</Typography>
                      </Box>

                      {promoApplied && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>Promo (BAKERY10)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>−₹{promoSaving.toFixed(2)}</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Delivery</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: shipping === 0 ? theme.palette.success.main : "inherit" }}>
                          {shipping === 0 ? "Free" : `₹${SHIPPING_COST.toFixed(2)}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2.5 }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                      <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Total</Typography>
                      <Typography variant="h6" sx={{ fontFamily: "var(--font-display)", fontWeight: 800, color: theme.palette.primary.main }}>
                        ₹{orderTotal.toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Promo code */}
                    <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoError(false); }}
                        error={promoError}
                        helperText={promoError ? "Invalid promo code" : promoApplied ? "✓ Discount applied" : ""}
                        FormHelperTextProps={{ sx: { color: promoApplied ? theme.palette.success.main : theme.palette.error.main, mt: 0.5 } }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" } }}
                        disabled={promoApplied}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                      <Button variant="outlined" onClick={handleApplyPromo} disabled={promoApplied || !promoCode.trim()} sx={{ borderRadius: 2, flexShrink: 0, fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {promoApplied ? "Applied" : "Apply"}
                      </Button>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<LockOutlinedIcon />}
                      onClick={handleCheckout}
                      sx={{
                        borderRadius: 3, py: 1.6, fontSize: "1rem", fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        "&:hover": { boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.45)}`, transform: "translateY(-1px)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      Proceed to Checkout
                    </Button>

                    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
                      {[
                        { icon: <LockOutlinedIcon sx={{ fontSize: "0.95rem" }} />, text: "Secure SSL checkout" },
                        { icon: <LocalShippingOutlinedIcon sx={{ fontSize: "0.95rem" }} />, text: `Free delivery over ₹${SHIPPING_THRESHOLD}` },
                        { icon: <SpaOutlinedIcon sx={{ fontSize: "0.95rem" }} />, text: "Fresh, handmade daily" },
                      ].map(({ icon, text }) => (
                        <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ color: alpha(theme.palette.primary.main, 0.5) }}>{icon}</Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem" }}>{text}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          )}
        </Container>
      </main>

      <Footer />

      {/* ── Delivery confirmation modal ── */}
      <DeliveryConfirmModal
        open={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        onConfirm={handleConfirmAndPay}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        orderTotal={orderTotal}
        isPlacingOrder={isPlacingOrder}
      />

      {/* ── Login modal ── */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => { setLoginModalOpen(false); setDeliveryModalOpen(true); }}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} sx={{ borderRadius: 2, fontSize: "0.85rem" }}>
          {snackMsg || (removedName && <><strong>{removedName}</strong> removed from your cart</>)}
        </Alert>
      </Snackbar>
    </>
  );
}