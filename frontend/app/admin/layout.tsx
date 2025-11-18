'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/molecules/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/atoms/logo';
import { useAuth } from '@/hooks/auth.hook';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const isLoginPage = pathname === '/admin/login';

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    return (
        <div className="fixed inset-0 bg-background">
            <div className="max-w-[1200px] mx-auto h-full">
                <div className="flex h-screen">
                    {!isLoginPage && (
                        <div className="hidden lg:flex">
                            <AdminSidebar
                                organizationName="ONG Mãos Amigas"
                                showThemeToggle={true}
                                onLogout={handleLogout}
                            />
                        </div>
                    )}

                    {!isLoginPage && sidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <button
                                className="fixed inset-0 bg-black/50"
                                onClick={() => setSidebarOpen(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape')
                                        setSidebarOpen(false);
                                }}
                                aria-label="Fechar menu lateral"
                            />
                            <div className="fixed left-0 top-0 h-full w-64 bg-background">
                                <AdminSidebar
                                    organizationName="ONG Mãos Amigas"
                                    onClose={() => setSidebarOpen(false)}
                                    onLogout={handleLogout}
                                />
                            </div>
                        </div>
                    )}

                    <div
                        className={`flex flex-1 flex-col overflow-hidden ${isLoginPage ? '' : 'lg:ml-64'}`}
                    >
                        {/* Mobile header */}
                        {!isLoginPage && (
                            <header className="lg:hidden shrink-0 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSidebarOpen(true)}
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                    <Logo size="sm" href="/admin" />
                                </div>
                            </header>
                        )}

                        <main className="flex-1 overflow-hidden flex flex-col">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
