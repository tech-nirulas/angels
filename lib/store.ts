import { api } from "@/redux/api";
import { reducer } from "@/redux/reducer";
import { env } from "@/utils/constants";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

console.log(env);

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(...Object.values(api).map((service) => service.middleware)),
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
