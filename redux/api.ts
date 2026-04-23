// redux/api.ts
import { authApiService } from "@/features/auth/authApiService";
import { cartApiService } from "@/features/cart/cartApiService";
import { categoryApiService } from "@/features/categories/categoriesApiService";
import { productApiService } from "@/features/products/productApiService";
import { userApiService } from "@/features/user/userApiService";
import { addressApiService } from "@/features/address/addressApiService";
import { orderApiService } from "@/features/order/orderApiService";

export const api = {
  categoryApiService,
  productApiService,
  authApiService,
  cartApiService,
  userApiService,
  addressApiService,
  orderApiService,
};
