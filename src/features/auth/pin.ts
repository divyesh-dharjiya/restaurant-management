/**
 * Staff PIN lock for the POS. This is a demo-grade gate for a browser-only app:
 * it keeps casual visitors out of the staff screens, but anyone with access to
 * the device's storage can still read the data. A real deployment needs server
 * authentication.
 */

export const PIN_KEY = "eatinghub:pin:v1";
export const UNLOCK_KEY = "eatinghub:unlocked:v1";
export const ATTEMPTS_KEY = "eatinghub:pin-attempts:v1";

export const PIN_LENGTH = { min: 4, max: 6 } as const;
/** Lock again after this long without a tap or key press. */
export const IDLE_LOCK_MS = 15 * 60_000;
export const MAX_ATTEMPTS = 5;
export const COOLDOWN_MS = 30_000;

export type StoredPin = { salt: string; hash: string };
export type Attempts = { count: number; until: number };

export const isValidPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH.min},${PIN_LENGTH.max}}$`).test(pin);

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export function newSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${pin}`)));
}

/** Constant-time string comparison, so timing doesn't reveal how much of a hash matched. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPin(pin: string, stored: StoredPin): Promise<boolean> {
  return safeEqual(await hashPin(pin, stored.salt), stored.hash);
}

/** Record a failed attempt; the fifth in a row starts a cooldown. */
export function failAttempt(prev: Attempts, now: number): Attempts {
  const count = prev.until > now ? prev.count : prev.until ? 0 : prev.count;
  const next = count + 1;
  return next >= MAX_ATTEMPTS ? { count: 0, until: now + COOLDOWN_MS } : { count: next, until: 0 };
}

export const cooldownLeft = (a: Attempts, now: number) => Math.max(0, a.until - now);

/** True when the last activity is recent enough to stay unlocked. */
export const stillUnlocked = (lastActive: number | null, now: number) => lastActive !== null && now - lastActive < IDLE_LOCK_MS;

// ── Storage helpers (all failures are treated as "nothing stored") ──────────

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const pinStore = {
  getPin: () => {
    const p = read<StoredPin>(localStorage, PIN_KEY);
    return p && typeof p.salt === "string" && typeof p.hash === "string" ? p : null;
  },
  setPin: (p: StoredPin | null) => write(localStorage, PIN_KEY, p),
  getAttempts: (): Attempts => read<Attempts>(localStorage, ATTEMPTS_KEY) ?? { count: 0, until: 0 },
  setAttempts: (a: Attempts | null) => write(localStorage, ATTEMPTS_KEY, a),
  getLastActive: () => read<number>(sessionStorage, UNLOCK_KEY),
  setLastActive: (t: number | null) => write(sessionStorage, UNLOCK_KEY, t),
};
