"use client";

import { useGetAvailableOffersQuery, useValidateOfferCodeMutation } from "@/features/offer/offerApiService";
import { applyPromo } from "@/features/cart/cartSlice";
import { useAppDispatch } from "@/lib/store";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";

interface AvailableCouponsDrawerProps {
  open: boolean;
  onClose: () => void;
  cartItems: { productId: string; categoryId?: string; quantity: number; unitPrice: number }[];
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function AvailableCouponsDrawer({
  open,
  onClose,
  cartItems,
  onSuccess,
  onError,
}: AvailableCouponsDrawerProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const { data: offersData, isLoading } = useGetAvailableOffersQuery(undefined, {
    skip: !open,
  });

  const [validateOfferCode] = useValidateOfferCodeMutation();

  const offers = Array.isArray(offersData?.data)
    ? offersData.data
    : Array.isArray(offersData)
    ? offersData
    : [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = async (code: string) => {
    setApplyingCode(code);
    try {
      const res = await validateOfferCode({
        code,
        cartItems: cartItems.map((item) => ({
          productId: item.productId,
          categoryId: item.categoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }).unwrap();

      if (res?.data) {
        dispatch(
          applyPromo({
            code: res.data.code,
            discountAmount: res.data.discountAmount,
            offerId: res.data.offerId,
            title: res.data.title,
          })
        );
        if (onSuccess) onSuccess(`Coupon '${code}' applied successfully! Save ₹${res.data.discountAmount}`);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? "Failed to apply coupon";
      if (onError) onError(msg);
    } finally {
      setApplyingCode(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          p: 0,
          backgroundColor: "#FBF9F7",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #2D1527 100%)`,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LocalOfferIcon sx={{ fontSize: 24, color: "#FFD700" }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.1rem" }}>
              Available Coupons & Offers
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>
              Apply a promo code to get instant savings
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#FFFFFF", p: 0.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, overflowY: "auto", flex: 1 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : offers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <LocalOfferIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              No promo codes available right now
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Check back soon for exciting discount offers!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {offers.map((offer: any) => {
              const isApplying = applyingCode === offer.code;

              return (
                <Paper
                  key={offer.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1.5px dashed ${theme.palette.primary.main}40`,
                    backgroundColor: "#FFFFFF",
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={offer.code}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          letterSpacing: "0.05em",
                          backgroundColor: `${theme.palette.primary.main}15`,
                          color: theme.palette.primary.main,
                          borderRadius: 1.5,
                          px: 0.5,
                        }}
                      />
                      <IconButton size="small" onClick={() => handleCopy(offer.code)} sx={{ p: 0.5 }}>
                        {copiedCode === offer.code ? (
                          <CheckIcon sx={{ fontSize: 16, color: "success.main" }} />
                        ) : (
                          <ContentCopyIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        )}
                      </IconButton>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={isApplying}
                      onClick={() => handleApply(offer.code)}
                      sx={{
                        borderRadius: "20px",
                        px: 2,
                        py: 0.5,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "none",
                        boxShadow: "none",
                      }}
                    >
                      {isApplying ? <CircularProgress size={16} color="inherit" /> : "Apply"}
                    </Button>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                    {offer.title}
                  </Typography>

                  {offer.description && (
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", mb: 1 }}>
                      {offer.description}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    {offer.minOrderValue && (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.72rem" }}>
                        Min Order: ₹{offer.minOrderValue}
                      </Typography>
                    )}
                    {offer.maxDiscount && (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.72rem" }}>
                        • Max Cap: ₹{offer.maxDiscount}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
