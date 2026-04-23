import { API_BASE_URL } from "@/utils/constants";

export async function requestOtp(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to send OTP");
  return res.json();
}

export async function verifyOtp(email: string, otp: string, guestCart?: any[]) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, guestCart }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "OTP verification failed");
  }
  return res.json();
}
