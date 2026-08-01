import getDecryptedToken from "@/helpers/decryptToken.helper";
import {
  getRefreshToken,
  saveEncryptedToken,
  saveRefreshToken,
  clearTokens,
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

// Shared baseQuery with automatic re-authentication (RTR) on 401
export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        // Direct fetch call to avoid circular RTK-Query dependencies
        const refreshResult = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResult.ok) {
          const envelope = await refreshResult.json();
          // ResponseInterceptor wraps response in { status: true, data: { accessToken, refreshToken, user } }
          const refreshData = envelope.data;

          if (refreshData && refreshData.accessToken) {
            // Save new tokens
            await saveEncryptedToken(refreshData.accessToken);
            saveRefreshToken(refreshData.refreshToken);

            // Update Redux store
            api.dispatch(
              setCredentials({
                token: refreshData.accessToken,
                user: refreshData.user,
              })
            );

            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
            clearTokens();
          }
        } else {
          api.dispatch(logout());
          clearTokens();
        }
      } catch (err) {
        api.dispatch(logout());
        clearTokens();
      }
    } else {
      api.dispatch(logout());
      clearTokens();
    }
  }

  return result;
};
