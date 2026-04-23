// components/ui/AddToCartButton.tsx
"use client";

import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
} from "@/features/cart/cartApiService";
import { addToGuestCart, openCart, updateGuestQuantity } from "@/features/cart/cartSlice";
import { Product } from "@/interfaces/product.interface";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import AddIcon from "@mui/icons-material/Add";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, CircularProgress, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useMemo, useState } from "react";

interface AddToCartButtonProps {
  item: Product;
}

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [isUpdating, setIsUpdating] = useState(false);

  const [addToCartMutation, { isLoading: isAdding }] = useAddToCartMutation();
  const [updateCartQuantity] = useUpdateCartQuantityMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  // Unwrap { data: CartItem[] } — matches actual API response shape
  const { data: serverCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverCart = serverCartResponse?.data ?? [];
  console.log("🚀 ~ AddToCartButton ~ serverCart:", serverCart)

  const guestItems = useAppSelector((s) => s.cart.guestItems);

  const quantity = useMemo(() => {
    if (isAuthenticated) {
      return serverCart.find((i) => i.productId === item.id)?.quantity ?? 0;
    }
    return guestItems.find((i) => i.productId === item.id)?.quantity ?? 0;
  }, [isAuthenticated, serverCart, guestItems, item.id]);

  const handleAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isAuthenticated) {
        await addToCartMutation({ productId: item.id, quantity: 1 });
      } else {
        dispatch(
          addToGuestCart({
            productId: item.id,
            product: {
              id: item.id,
              name: item.name,
              slug: item.slug,
              description: "",
              basePrice: item.basePrice,
              inStock: item.inStock ?? true,
              mainImage: item.mainImage ?? null,
            },
          })
        );
        dispatch(openCart());
      }
    },
    [dispatch, addToCartMutation, item, isAuthenticated]
  );

  const handleUpdateQuantity = useCallback(
    async (e: React.MouseEvent, delta: number) => {
      e.stopPropagation();
      const newQty = quantity + delta;

      if (isAuthenticated) {
        setIsUpdating(true);
        try {
          if (newQty <= 0) {
            await removeFromCart(item.id);
          } else {
            await updateCartQuantity({ productId: item.id, quantity: newQty });
          }
        } finally {
          setIsUpdating(false);
        }
      } else {
        dispatch(updateGuestQuantity({ productId: item.id, quantity: newQty }));
      }
    },
    [dispatch, isAuthenticated, quantity, item.id, updateCartQuantity, removeFromCart]
  );

  if (item.inStock === false) {
    return (
      <Button
        fullWidth
        variant="contained"
        disabled
        sx={{ borderRadius: 2, py: 1, backgroundColor: theme.palette.grey[400] }}
      >
        Out of Stock
      </Button>
    );
  }

  if (quantity > 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: `1.5px solid ${theme.palette.primary.main}`,
          borderRadius: "10px",
          overflow: "hidden",
          width: "100%",
          opacity: isUpdating ? 0.6 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => handleUpdateQuantity(e, -1)}
          disabled={isUpdating}
          sx={{
            borderRadius: 0,
            width: 40,
            height: 40,
            "&:hover": { background: theme.palette.action.hover },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.9rem",
            minWidth: 32,
            textAlign: "center",
            color: theme.palette.primary.main,
          }}
        >
          {isUpdating ? <CircularProgress size={14} /> : quantity}
        </Typography>

        <IconButton
          size="small"
          onClick={(e) => handleUpdateQuantity(e, 1)}
          disabled={isUpdating}
          sx={{
            borderRadius: 0,
            width: 40,
            height: 40,
            "&:hover": { background: theme.palette.action.hover },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Button
      fullWidth
      variant="contained"
      startIcon={isAdding ? null : <AddShoppingCartIcon />}
      onClick={handleAdd}
      disabled={isAdding}
      sx={{ borderRadius: 2, py: 1 }}
    >
      {isAdding ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Add to Cart"}
    </Button>
  );
}