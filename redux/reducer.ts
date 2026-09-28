import { api } from '@/redux/api';
import cartSlice from "@/features/cart/cartSlice"
import authSlice from "@/features/auth/authSlice"

/**
 * The API reducers are spread in explicitly rather than via Object.fromEntries:
 * `Object.fromEntries` returns `{ [k: string]: Reducer }`, which widened every
 * `state.<api>` lookup to `any` and silently killed inference for every
 * `useAppSelector` in the app. Naming them keeps the real slice types.
 */
export const reducer = {
  cart: cartSlice,
  auth: authSlice,
  categoryApiService: api.categoryApiService.reducer,
  productApiService: api.productApiService.reducer,
  authApiService: api.authApiService.reducer,
  cartApiService: api.cartApiService.reducer,
  userApiService: api.userApiService.reducer,
  addressApiService: api.addressApiService.reducer,
  orderApiService: api.orderApiService.reducer,
  cakeApiService: api.cakeApiService.reducer,
  offerApiService: api.offerApiService.reducer,
};
