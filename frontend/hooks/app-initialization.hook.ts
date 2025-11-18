import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

export const useAppInitialization = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { setAuth } = useAuthStore();

    const allCookies = Cookies.get();
    const hasAuthCookie = allCookies && Object.keys(allCookies).length > 0;

    const { data: userData, isLoading: isLoadingUser } = useQuery({
        queryKey: ['user'],
        queryFn: () => authApi.getMe(),
        enabled: hasAuthCookie,
        retry: false,
        staleTime: 1000 * 60 * 60, // 1 hora
    });

    useEffect(() => {
        if (userData?.user && userData?.organization) {
            setAuth(userData.user.id, userData.organization);
        }
    }, [userData, setAuth]);

    useEffect(() => {
        if (!isLoadingUser && userData?.user && pathname === '/') {
            router.push('/admin/dashboard');
        }
    }, [isLoadingUser, userData, pathname, router]);

    return {
        isLoadingUser,
        isAuthenticated: !!userData?.user,
    };
};
