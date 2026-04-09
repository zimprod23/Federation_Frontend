import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       token: null,
//       user: null,

//       setAuth: (token, user) => {
//         localStorage.setItem("token", token);
//         set({ token, user });
//       },

//       clearAuth: () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         set({ token: null, user: null });
//       },

//       isAuthenticated: () => !!get().token,
//     }),
//     {
//       name: "auth-storage",
//       partialize: (state) => ({
//         token: state.token,
//         user: state.user,
//       }),
//     },
//   ),
// );
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => {
        // No need for manual localStorage.setItem here!
        // Persist middleware handles it.
        set({ token, user });
      },

      clearAuth: () => {
        // Just clear the state. Persist middleware will
        // automatically clear the 'auth-storage' key.
        set({ token: null, user: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
    },
  ),
);
