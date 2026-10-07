import { configureStore } from "@reduxjs/toolkit";
import type { PosState } from "@/types/pos";
import pos from "./slices/posSlice";

export const makeStore = (preloaded?: PosState) =>
  configureStore({ reducer: { pos }, preloadedState: preloaded ? { pos: preloaded } : undefined });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
