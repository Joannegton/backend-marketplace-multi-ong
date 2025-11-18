'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToasterProvider } from './toaster-provider';

export function Providers({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <QueryProvider>
            <ThemeProvider defaultTheme="light">
                <ToasterProvider />
                {children}
            </ThemeProvider>
        </QueryProvider>
    );
}
