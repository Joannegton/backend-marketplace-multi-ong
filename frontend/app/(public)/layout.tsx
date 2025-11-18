'use client';

import { MobileNavbar } from '@/components/molecules/mobile-navbar';
import { PublicNavbar } from '@/components/molecules/public-navbar';

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-background">
            <div className="hidden md:block">
                <PublicNavbar />
            </div>

            <div className="md:hidden">
                <MobileNavbar />
            </div>

            <div className="pt-16 md:pt-16">
                <div className="max-w-[1200px] mx-auto">{children}</div>
            </div>
        </div>
    );
}
