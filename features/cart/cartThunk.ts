import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks for server cart operations
export const fetchServerCart = createAsyncThunk(
  "cart/fetchServerCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = await getDecryptedToken();
      if (!token) return [];

      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch cart");
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const addToServerCart = createAsyncThunk(
  "cart/addToServerCart",
  async (
    { productId, quantity }: { productId: string; quantity?: number },
    { getState, rejectWithValue },
  ) => {
    try {
      const token = await getDecryptedToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity: quantity || 1 }),
        },
      );

      if (!response.ok) throw new Error("Failed to add to cart");
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateServerCartQuantity = createAsyncThunk(
  "cart/updateServerCartQuantity",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      const token = await getDecryptedToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/cart/item/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        },
      );

      if (!response.ok) throw new Error("Failed to update cart");
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeFromServerCart = createAsyncThunk(
  "cart/removeFromServerCart",
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = await getDecryptedToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/cart/item/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to remove from cart");
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const clearServerCart = createAsyncThunk(
  "cart/clearServerCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getDecryptedToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/cart/clear`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to clear cart");
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
