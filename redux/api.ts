// redux/api.ts
import { authApiService } from "@/features/auth/authApiService";
import { cartApiService } from "@/features/cart/cartApiService";
import { categoryApiService } from "@/features/categories/categoriesApiService";
import { productApiService } from "@/features/products/productApiService";
import { userApiService } from "@/features/user/userApiService";
import { addressApiService } from "@/features/address/addressApiService";
import { orderApiService } from "@/features/order/orderApiService";
import { cakeApiService } from "@/features/cake-customization/cakeApiService";
import { offerApiService } from "@/features/offer/offerApiService";

export const api = {
  categoryApiService,
  productApiService,
  authApiService,
  cartApiService,
  userApiService,
  addressApiService,
  orderApiService,
  cakeApiService,
  offerApiService,
};
