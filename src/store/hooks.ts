import { useSyncExternalStore } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initialState } from "./slices/posSlice";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

const SERVER_STATE: RootState = { pos: initialState };
const noopSubscribe = () => () => {};

/** False during SSR and the hydration render, true afterwards. */
export const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

/**
 * The store is preloaded from localStorage on the client, so during hydration we
 * select from the server's initial state to produce identical markup, then re-render.
 */
export function useAppSelector<T>(selector: (s: RootState) => T): T {
  const isClient = useIsClient();
  return useSelector((s: RootState) => selector(isClient ? s : SERVER_STATE));
}
