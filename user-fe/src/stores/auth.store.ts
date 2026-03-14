import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import type { AuthUser } from "@/modules/auth/types";
import { API_URL_LOGIN } from "@/constant/config";

type AuthState = {
    user: AuthUser | null;

    setUser: (user: AuthUser) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            org: null,
            user: null,


            setUser: (user) => {
                if (!user) {
                    set({ user: null });
                    return;
                }
                set({ user });
            },

            logout: async () => {
                try {
                    await axios.post(
                        `${API_URL_LOGIN}/logout`,
                        {},
                        { withCredentials: true },
                    );
                } catch (e) {
                    console.error("Logout failed:", e);
                }
                set({ user: null });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user}),
        },
    ),
);
