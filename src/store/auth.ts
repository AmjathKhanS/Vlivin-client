import { create } from 'zustand';
import { api, tokenStore, setUnauthorizedHandler, type Me } from '@/lib/api';
import { realtime } from '@/lib/ws';

type Status = 'booting' | 'signedOut' | 'needsProfile' | 'needsPairing' | 'ready';

type AuthState = {
  status: Status;
  me: Me | null;
  boot: () => Promise<void>;
  signIn: (token: string, isNew: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const statusFor = (me: Me): Status =>
  !me.name?.trim() ? 'needsProfile' : me.pairing.state === 'paired' ? 'ready' : 'needsPairing';

export const useAuth = create<AuthState>((set, get) => ({
  status: 'booting',
  me: null,
  boot: async () => {
    const token = await tokenStore.get();
    if (!token) return set({ status: 'signedOut' });
    try { await get().refresh(); } catch { set({ status: 'signedOut' }); }
  },
  signIn: async (token) => {
    await tokenStore.set(token);
    await get().refresh();
  },
  refresh: async () => {
    const me = await api.me();
    const status = statusFor(me);
    set({ me, status });
    if (status === 'ready') realtime.connect(); else realtime.disconnect();
  },
  signOut: async () => {
    realtime.disconnect();
    await tokenStore.clear();
    set({ me: null, status: 'signedOut' });
  },
}));

setUnauthorizedHandler(() => useAuth.getState().signOut());
