import { isMockMode } from '@/lib/use-mock';
import { apiRequest, setToken } from '@/lib/api/client';

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  message: string;
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  if (isMockMode()) {
    const fake: AuthResponse = {
      token: 'mock-patient-token',
      role: 'PATIENT',
      userId: 1,
      message: 'Mock login',
    };
    await setToken(fake.token);
    return fake;
  }
  const res = await apiRequest<AuthResponse>('/auth/patient/login', {
    method: 'POST',
    auth: false,
    body: { identifier, password },
  });
  if (res.token) await setToken(res.token);
  return res;
}

export async function signup(input: {
  fullName: string;
  phone: string;
  password: string;
  ghanaCard: string;
}): Promise<void> {
  if (isMockMode()) return;
  await apiRequest('/auth/patient/signup', {
    method: 'POST',
    auth: false,
    body: input,
  });
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  if (isMockMode()) {
    await setToken('mock-patient-token');
    return;
  }
  await apiRequest('/auth/patient/verify-otp', {
    method: 'POST',
    auth: false,
    body: { phone, code },
  });
}

export async function resendOtp(phone: string): Promise<void> {
  if (isMockMode()) {
    await delay(400);
    return;
  }
  await apiRequest('/auth/patient/resend-otp', {
    method: 'POST',
    auth: false,
    body: { phone },
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Password reset (FE-mocked) ---
// BACKEND_SPEC (BE-11): three patient/staff-scoped endpoints are needed —
// request-reset, verify, and set-new-password — distinct from the
// logged-in change-password endpoint. None of these exist server-side yet;
// everything below resolves against mock data until BE-11 ships, same as
// the rest of the app's isMockMode() calls.
//
// Identifier type is TBD with the backend owner — phone is used here per
// the Ghana SMS-OTP norm the rest of auth already follows (see login/signup).
// It's passed through as an opaque string so swapping to email/Ghana-Card
// later is a one-line change at the call sites, not here.

export async function requestPasswordReset(identifier: string): Promise<void> {
  if (isMockMode()) {
    await delay(600);
    return;
  }
  await apiRequest('/auth/patient/password-reset/request', {
    method: 'POST',
    auth: false,
    body: { identifier },
  });
}

export async function verifyPasswordResetOtp(
  identifier: string,
  code: string
): Promise<{ resetToken: string }> {
  if (isMockMode()) {
    await delay(500);
    return { resetToken: 'mock-reset-token' };
  }
  return apiRequest('/auth/patient/password-reset/verify', {
    method: 'POST',
    auth: false,
    body: { identifier, code },
  });
}

export async function resetPassword(input: {
  identifier: string;
  resetToken: string;
  newPassword: string;
}): Promise<void> {
  if (isMockMode()) {
    await delay(600);
    return;
  }
  await apiRequest('/auth/patient/password-reset/confirm', {
    method: 'POST',
    auth: false,
    body: input,
  });
}
