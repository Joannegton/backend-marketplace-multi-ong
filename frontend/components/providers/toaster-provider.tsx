'use client';

import { Toaster } from 'sonner';
import { useTheme } from './theme-provider';

export function ToasterProvider() {
    const { theme } = useTheme();

    return (
        <Toaster
            position="top-center"
            duration={5000}
            theme={theme as 'dark' | 'light' | 'system'}
            toastOptions={{
                classNames: {
                    toast: 'text-base md:text-lg px-6 py-4',
                },
            }}
        />
    );
}
