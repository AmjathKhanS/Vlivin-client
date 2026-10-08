import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

export const API_URL: string = (Constants.expoConfig?.extra as any)?.apiUrl ?? 'http://localhost:3000';
const TOKEN_KEY = 'vlivin.token';

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (t: string) => SecureStore.setItemAsync(TOKEN_KEY, t),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await tokenStore.get();
  const ctrl = new AbortController();
  // Render free tier cold start can take ~1 minute.
  const timer = setTimeout(() => ctrl.abort(), 75_000);
  try {
    const res = await fetch(`${API_URL}/v1${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && token) onUnauthorized?.();
      throw new ApiError(res.status, json?.error?.code ?? 'error', json?.error?.message ?? 'Something went wrong');
    }
    return json as T;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new ApiError(0, 'timeout', 'The server is waking up. Try again in a moment.');
    throw e;
  } finally { clearTimeout(timer); }
}

export const http = {
  get: <T>(p: string) => request<T>('GET', p),
  post: <T>(p: string, b?: unknown) => request<T>('POST', p, b ?? {}),
  put: <T>(p: string, b?: unknown) => request<T>('PUT', p, b ?? {}),
  patch: <T>(p: string, b?: unknown) => request<T>('PATCH', p, b ?? {}),
  del: <T>(p: string) => request<T>('DELETE', p),
};

export type PublicUser = { id: string; name: string; city: string | null; tz: string; avatarUrl: string | null };
export type Pairing =
  | { state: 'unpaired' }
  | { state: 'paired'; coupleId: string }
  | { state: 'pending'; code: string; expiresAt: string; hoursLeft: number };
export type Me = PublicUser & { phone: string | null; pairing: Pairing };
export type CoupleInfo = {
  id: string; togetherSince: string | null; meetDate: string | null; dayCount: number | null;
  daysToGo: number | null; distanceKm: number | null;
  me: PublicUser & { localTime: string }; partner: PublicUser & { localTime: string; online: boolean };
};

export const api = {
  requestOtp: (phone: string) => http.post<{ devCode?: string }>('/auth/phone/request', { phone }),
  verifyOtp: (phone: string, code: string) =>
    http.post<{ token: string; isNew: boolean; user: PublicUser }>('/auth/phone/verify', { phone, code }),
  social: (provider: 'apple' | 'google', idToken: string) =>
    http.post<{ token: string; isNew: boolean; user: PublicUser }>('/auth/social', { provider, idToken }),
  me: () => http.get<Me>('/me'),
  updateMe: (p: Partial<Pick<PublicUser, 'name' | 'city' | 'tz'>>) => http.patch<PublicUser>('/me', p),
  pairingCode: () => http.post<{ code: string; expiresAt: string }>('/pairing/code'),
  pairingStatus: () => http.get<Pairing>('/pairing/status'),
  pairingJoin: (code: string) => http.post<unknown>('/pairing/join', { code }),
  couple: () => http.get<CoupleInfo>('/couple'),
  updateCouple: (p: { togetherSince?: string | null; meetDate?: string | null }) => http.patch<unknown>('/couple', p),
};
