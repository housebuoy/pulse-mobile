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
