import { API_URL, tokenStore } from './api';

type Msg = { type: string; data: any };
type Listener = (data: any) => void;

/** Auto-reconnecting socket with exponential backoff, heartbeat and typed subscriptions. */
class Realtime {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private retry = 0;
  private hb: ReturnType<typeof setInterval> | null = null;
  private wanted = false;
  private statusListeners = new Set<(online: boolean) => void>();

  async connect() {
    this.wanted = true;
    if (this.ws && this.ws.readyState <= 1) return;
    const token = await tokenStore.get();
    if (!token) return;
    const url = API_URL.replace(/^http/, 'ws') + `/v1/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0; this.emitStatus(true);
      this.hb = setInterval(() => this.send('ping', {}), 25_000);
    };
    ws.onmessage = (e) => {
      try { const m: Msg = JSON.parse(String(e.data)); this.listeners.get(m.type)?.forEach((l) => l(m.data)); } catch {}
    };
    ws.onclose = (e: any) => {
      if (this.hb) clearInterval(this.hb);
      if (e?.code === 4401 || e?.code === 4403) { this.wanted = false; } // unauthorized / not paired: don't loop
      this.emitStatus(false);
      if (this.wanted) setTimeout(() => this.connect(), Math.min(15_000, 600 * 2 ** this.retry++));
    };
    ws.onerror = () => ws.close();
  }
  disconnect() { this.wanted = false; this.ws?.close(); this.ws = null; }
  /** Client messages are flat: { type, ...payload } (e.g. game.move {gameId, cell}). */
  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.ws?.readyState === 1) this.ws.send(JSON.stringify({ type, ...payload }));
  }
  on(type: string, fn: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
    return () => { this.listeners.get(type)?.delete(fn); };
  }
  onStatus(fn: (online: boolean) => void) { this.statusListeners.add(fn); return () => { this.statusListeners.delete(fn); }; }
  private emitStatus(v: boolean) { this.statusListeners.forEach((f) => f(v)); }
}
export const realtime = new Realtime();
