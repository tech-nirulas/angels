// components/ui/CartBadge.tsx
"use client";

import { useGetCartQuery } from "@/features/cart/cartApiService";
import { selectGuestCartCount } from "@/features/cart/cartSlice";
import { useAppSelector } from "@/lib/store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Badge, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // Server cart count — only fetched when logged in
  const { data: serverItems } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverCount = serverItems?.data?.reduce((sum, i) => sum + i.quantity, 0);

  // Guest cart count from Redux/localStorage
  const guestCount = useAppSelector(selectGuestCartCount);

  const cartCount = isAuthenticated ? serverCount : guestCount;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton sx={{ color: "inherit" }}>
        <ShoppingCartIcon />
      </IconButton>
    );
  }

  return (
    <IconButton onClick={() => router.push("/cart")} sx={{ color: "inherit" }}>
      <Badge
        badgeContent={cartCount}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.7rem",
            minWidth: "18px",
            height: "18px",
            borderRadius: "9px",
          },
        }}
      >
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
}