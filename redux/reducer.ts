import { api } from '@/redux/api';
import cartSlice from "@/features/cart/cartSlice"
import authSlice from "@/features/auth/authSlice"

export const reducer = {
  cart: cartSlice,
  auth: authSlice,
  ...Object.fromEntries(
    Object.values(api).map((service) => [
      service.reducerPath,
      service.reducer,
    ])
  ),
};