"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KeyRound, LockKeyhole, ShieldAlert } from "lucide-react";
import { routes } from "@/config/site";
import { LogoMark } from "@/components/layout/Logo";
import { useIsClient } from "@/store/hooks";
import { COOLDOWN_MS, PIN_LENGTH, cooldownLeft, failAttempt, hashPin, isValidPin, newSalt, pinStore, stillUnlocked, verifyPin } from "./pin";

type Phase = "setup" | "locked" | "unlocked";

const LockContext = createContext<() => void>(() => {});
/** Lock the POS now (navbar button). */
export const useStaffLock = () => useContext(LockContext);

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/** Wipes every EatingHUB key on this device (data, PIN, attempts). The theme is kept. */
function eraseDeviceData() {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith("eatinghub:") || key.startsWith("tabletap:")) localStorage.removeItem(key);
    sessionStorage.clear();
  } catch {}
}

/**
 * Renders the staff app only after the PIN is entered. Unlocks last for this tab
 * and end after IDLE_LOCK_MS without activity.
 */
export function StaffGate({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    const stored = pinStore.getPin();
    // Deciding the phase needs browser storage, so it can only happen after mount.
    setPhase(!stored ? "setup" : stillUnlocked(pinStore.getLastActive(), Date.now()) ? "unlocked" : "locked");
  }, []);

  const lock = useCallback(() => {
    pinStore.setLastActive(null);
    setPhase("locked");
  }, []);

  // Keep the session alive while staff are using it; lock when idle.
  useEffect(() => {
    if (phase !== "unlocked") return;
    let last = 0;
    const touch = () => {
      const now = Date.now();
      if (now - last < 5_000) return; // throttle storage writes
      last = now;
      pinStore.setLastActive(now);
    };
    touch();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = setInterval(() => {
      if (!stillUnlocked(pinStore.getLastActive(), Date.now())) lock();
    }, 15_000);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(timer);
    };
  }, [phase, lock]);

  if (!isClient || phase === null) return <GateShell busy />;
  if (phase === "unlocked") return <LockContext.Provider value={lock}>{children}</LockContext.Provider>;
  return (
    <GateShell>
      {phase === "setup" ? <SetupForm onDone={() => setPhase("unlocked")} /> : <UnlockForm onDone={() => setPhase("unlocked")} onErased={() => setPhase("setup")} />}
    </GateShell>
  );
}

function GateShell({ children, busy }: { children?: React.ReactNode; busy?: boolean }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-10" aria-busy={busy || undefined}>
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-12" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted">EatingHUB POS</p>
        </div>
        {busy ? <div className="skeleton mx-auto mt-6 h-40 w-full rounded-2xl" /> : children}
        <p className="mt-6 text-center text-xs text-subtle">
          Not staff? <Link href={routes.home} className="underline underline-offset-2 hover:text-fg">Go to the restaurant site</Link>
        </p>
      </div>
    </main>
  );
}

function PinInput({ label, value, onChange, autoFocus, id }: { label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean; id: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={PIN_LENGTH.max}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH.max))}
        className="field h-14 text-center text-2xl tracking-[0.6em] tabular-nums"
      />
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{children}</p>;
}

function SetupForm({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPin(pin)) return setError(`Use ${PIN_LENGTH.min} to ${PIN_LENGTH.max} digits.`);
    if (pin !== confirmPin) return setError("The two PINs don't match.");
    setBusy(true);
    const salt = newSalt();
    pinStore.setPin({ salt, hash: await hashPin(pin, salt) });
    pinStore.setLastActive(Date.now());
    onDone();
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-extrabold">Create a staff PIN</h1>
        <p className="mt-1 text-sm text-muted">Staff enter this PIN to open the POS on this device.</p>
      </div>
      <PinInput id="pin-new" label="New PIN" value={pin} onChange={(v) => { setPin(v); setError(null); }} autoFocus />
      <PinInput id="pin-confirm" label="Confirm PIN" value={confirmPin} onChange={(v) => { setConfirmPin(v); setError(null); }} />
      {error && <ErrorText>{error}</ErrorText>}
      <button className="btn btn-primary h-12 w-full" disabled={busy}><KeyRound className="size-4" /> Save PIN and open POS</button>
    </form>
  );
}

function UnlockForm({ onDone, onErased }: { onDone: () => void; onErased: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(() => cooldownLeft(pinStore.getAttempts(), Date.now()));
  const [forgot, setForgot] = useState(false);
  const busy = useRef(false);

  // Count down a cooldown once a second.
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(cooldownLeft(pinStore.getAttempts(), Date.now())), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const check = async (value: string) => {
    const stored = pinStore.getPin();
    if (busy.current || !stored || wait > 0) return;
    busy.current = true;
    const ok = await verifyPin(value, stored);
    busy.current = false;
    if (ok) {
      pinStore.setAttempts(null);
      pinStore.setLastActive(Date.now());
      return onDone();
    }
    const attempts = failAttempt(pinStore.getAttempts(), Date.now());
    pinStore.setAttempts(attempts);
    setPin("");
    const left = cooldownLeft(attempts, Date.now());
    setWait(left);
    setError(left ? `Too many wrong PINs. Try again in ${Math.ceil(COOLDOWN_MS / 1000)} seconds.` : "Wrong PIN. Try again.");
  };

  if (forgot) {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <p>The PIN protects this device&apos;s bills and orders, so it can&apos;t be recovered. Resetting <b>erases all POS data on this device</b> (bills, tables, bookings, open orders) and lets you set a new PIN.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-ghost" onClick={() => setForgot(false)}>Back</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              eraseDeviceData();
              onErased();
            }}
          >
            Erase and reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValidPin(pin)) check(pin);
      }}
      className="mt-6 space-y-4"
    >
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-xl font-extrabold"><LockKeyhole className="size-5" /> POS locked</h1>
        <p className="mt-1 text-sm text-muted">Enter the staff PIN to continue.</p>
      </div>
      <PinInput id="pin" label="Staff PIN" value={pin} onChange={(v) => { setPin(v); setError(null); }} autoFocus />
      {wait > 0 ? <ErrorText>Too many wrong PINs. Try again in {Math.ceil(wait / 1000)}s.</ErrorText> : error && <ErrorText>{error}</ErrorText>}
      <button className="btn btn-primary h-12 w-full" disabled={wait > 0 || !isValidPin(pin)}>Unlock</button>
      <button type="button" className="mx-auto block text-xs text-muted underline underline-offset-2 hover:text-fg" onClick={() => setForgot(true)}>
        Forgot PIN?
      </button>
    </form>
  );
}
