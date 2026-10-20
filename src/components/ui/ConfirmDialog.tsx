"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Modal } from "./Modal";

export type ConfirmOptions = {
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
};

type Ask = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Ask | null>(null);

/**
 * In-app replacement for window.confirm(): `if (await confirm({ title })) …`.
 * Styled, keyboard accessible, and it doesn't block the page while open.
 */
export function useConfirm(): Ask {
  const ask = useContext(ConfirmContext);
  if (!ask) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ask;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(ok: boolean) => void>(undefined);

  const ask = useCallback<Ask>((o) => {
    resolver.current?.(false); // a newer question cancels an unanswered one
    setOpts(o);
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);

  const answer = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = undefined;
    setOpts(null);
  }, []);
  const cancel = useCallback(() => answer(false), [answer]);

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      <Modal
        open={!!opts}
        onClose={cancel}
        title={
          opts && (
            <h2 className="flex items-center gap-2 text-lg font-bold">
              {opts.danger && <AlertTriangle className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />}
              {opts.title}
            </h2>
          )
        }
      >
        {opts && (
          <div className="space-y-5">
            {opts.body && <div className="text-sm text-muted">{opts.body}</div>}
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost flex-1" onClick={cancel}>{opts.cancelLabel ?? "Cancel"}</button>
              <button type="button" autoFocus className={cn("btn flex-1", opts.danger ? "btn-danger" : "btn-primary")} onClick={() => answer(true)}>
                {opts.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}
