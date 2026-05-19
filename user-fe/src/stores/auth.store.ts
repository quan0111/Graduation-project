import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import type { AuthUser } from "@/modules/auth/types";
import { API_URL_LOGIN } from "@/constant/config";
import {
    STOREFRONT_AUTH_PERSIST_KEY,
    clearStorefrontSession,
    setStoredStorefrontUser,
} from "@/lib/auth-storage";

type AuthState = {
    user: AuthUser | null;

    setUser: (user: AuthUser | null) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,


            setUser: (user) => {
                if (!user) {
                    clearStorefrontSession();
                    set({ user: null });
                    return;
                }
                setStoredStorefrontUser(user);
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
                clearStorefrontSession();
                set({ user: null });
            },
        }),
        {
            name: STOREFRONT_AUTH_PERSIST_KEY,
            partialize: (state) => ({ user: state.user}),
        },
    ),
);
