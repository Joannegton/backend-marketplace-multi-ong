'use client';

import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { toast } from 'sonner';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const { setAuth, logout: logoutStore, setLoading } = useAuthStore();

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            await authApi.login(email, password);

            const userData = await authApi.getMe();
            if (userData) {
                setAuth(userData.user.id, userData.organization);
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Erro ao realizar login';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            const allCookies = Cookies.get();

            const cookieOptions = { path: '/', domain: undefined };
            for (const cookieName of Object.keys(allCookies)) {
                Cookies.remove(cookieName, cookieOptions);
            }

            queryClient.clear();

            logoutStore();

            await authApi.logout();

            toast.success('Logout realizado com sucesso!');
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Erro ao realizar logout';
            toast.error(errorMessage);

            const allCookies = Cookies.get();
            const cookieOptions = { path: '/', domain: undefined };
            for (const cookieName of Object.keys(allCookies)) {
                Cookies.remove(cookieName, cookieOptions);
            }
            queryClient.clear();
            logoutStore();
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        logout,
    };
};
