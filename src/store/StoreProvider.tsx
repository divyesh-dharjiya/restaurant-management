"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";
import { loadState, readSaved, saveState, STORAGE_KEYS } from "./persistence";
import { replace } from "./slices/posSlice";

/** Per-client store, preloaded from localStorage, saved on change and synced across tabs. */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore(loadState()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let last = store.getState().pos;
    saveState(last); // writes migrated / freshly seeded data straight away

    const unsubscribe = store.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const next = store.getState().pos;
        if (next === last) return;
        last = next;
        saveState(next);
      }, 120);
    });

    // Another tab saved: load its version (storage events only fire in *other* tabs).
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !STORAGE_KEYS.includes(e.key)) return;
      const next = readSaved();
      if (next) {
        last = next;
        store.dispatch(replace(next));
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
