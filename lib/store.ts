import { api } from "@/redux/api";
import { reducer } from "@/redux/reducer";
import { env } from "@/utils/constants";
import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

console.log(env);

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      // Cast is a documented RTK 2.12 limitation, verified in isolation:
      //   typeof api.x.middleware  ===  Middleware<{}, RootState<ApiX>>
      // and it is NOT assignable to Middleware<{}, FullStoreState> because
      // RootState<ApiX> is a strict subset of the store state (a Middleware is
      // contravariant in its state param, and RootState<ApiX> lacks `cart`/
      // `auth`). RTK 2.12 ships no buildMiddleware/enhanceReducers helper, and
      // `middleware:` as an array fails identically.
      //
      // Runtime invariant that makes it safe: Middleware<{}, S> uses S only in
      // `next(action): unknown` and in the `dispatch` it forwards to. Each api
      // middleware reads exactly the keys its own reducer owns, and dispatch is
      // already the store's real dispatch, so widening S discards no check the
      // runtime depends on. Nothing is asserted about app state here.
      ...(Object.values(api).map((service) => service.middleware as Middleware)),
    ),
  devTools: env !== "production",
});

/**
 * Enables RTK Query's refetchOnFocus / refetchOnReconnect behaviour.
 *
 * The Admin Panel and this consumer app are separate browser runtimes with
 * separate caches, so an admin change cannot be pushed here directly. Opting in
 * to the focus/reconnect listeners means a tab that is already open picks the
 * change up when the user returns to it, without polling or websockets.
 * Individual queries still opt in per-hook (see CakesCategoryNav).
 */
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
