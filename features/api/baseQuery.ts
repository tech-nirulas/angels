import getDecryptedToken from "@/helpers/decryptToken.helper";
import {
  clearTokens,
  getRefreshToken,
  saveEncryptedToken,
  saveRefreshToken,
} from "@/helpers/encryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../auth/authSlice";

// Shared baseQuery with authorization headers
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    headers.set("Content-Type", "application/json");

    const token = await getDecryptedToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Singleton promise to deduplicate concurrent refresh requests across API calls
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(api: any): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    api.dispatch(logout());
    clearTokens();
    return null;
  }

  try {
    const refreshResult = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResult.ok) {
      const envelope = await refreshResult.json();
      const refreshData = envelope.data || envelope;

      if (refreshData && refreshData.accessToken) {
        await saveEncryptedToken(refreshData.accessToken);
        if (refreshData.refreshToken) {
          saveRefreshToken(refreshData.refreshToken);
        }

        api.dispatch(
          setCredentials({
            token: refreshData.accessToken,
            user: refreshData.user,
          })
        );

        return refreshData.accessToken;
      }
    }

    api.dispatch(logout());
    clearTokens();
    return null;
  } catch (_err) {
    api.dispatch(logout());
    clearTokens();
    return null;
  }
}

// Shared baseQuery with automatic re-authentication (RTR) on 401
export const baseQueryWithReauth = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = performRefresh(api).finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
