import { MeResponse } from '@/lib/types';
import { create } from 'zustand';

export interface AuthState {
    userId: string | null;
    organization: MeResponse['organization'] | null;
    isAuthenticated: boolean;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setAuth: (userId: string, organization: MeResponse['organization']) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    userId: null,
    organization: null,
    isAuthenticated: false,
    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
    setAuth: (userId, organization) =>
        set({
            userId,
            organization,
            isAuthenticated: true,
        }),
    logout: () =>
        set({
            userId: null,
            organization: null,
            isAuthenticated: false,
        }),
}));
