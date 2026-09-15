import { create } from "zustand";
import type { CurrentUser, SessionStatus } from "../types/auth.types";

interface SessionState {
  user: CurrentUser | null;
  status: SessionStatus;
  setChecking: () => void;
  setSession: (user: CurrentUser) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: "checking",
  setChecking: () => set({ status: "checking" }),
  setSession: (user) => set({ user, status: "authenticated" }),
  clearSession: () => set({ user: null, status: "anonymous" }),
}));
