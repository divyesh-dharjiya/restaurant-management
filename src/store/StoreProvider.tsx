"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";
import { loadState, saveState, STORAGE_KEY } from "./persistence";
import { replace } from "./slices/posSlice";

/** Per-client store, preloaded from localStorage, saved on change and synced across tabs. */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore(loadState()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let last = "";
    const persist = () => {
      const state = store.getState().pos;
      const next = JSON.stringify(state);
      if (next === last) return;
      last = next;
      saveState(state);
    };
    persist(); // writes the migrated/seeded state immediately

    const unsubscribe = store.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(persist, 120);
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === last) return;
      try {
        last = e.newValue;
        store.dispatch(replace(JSON.parse(e.newValue)));
      } catch {}
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
