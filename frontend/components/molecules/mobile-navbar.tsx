'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useShoppingCartStore } from '@/store/cart.store';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface MobileNavbarProps {
    onSearch?: (query: string) => void;
}

const menuItems = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: ShoppingCart, label: 'Carrinho', href: '/cart' },
];

export function MobileNavbar({ onSearch }: Readonly<MobileNavbarProps>) {
    const { shoppingCart } = useShoppingCartStore();
    const cartItemCount = shoppingCart?.items?.length ?? 0;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);
    const handleSearchClose = useCallback(() => {
        setIsSearchOpen(false);
        setSearchQuery('');
    }, []);

    const handleSearch = useCallback(
        (query: string) => {
            if (query.trim()) {
                onSearch?.(query);
                handleSearchClose();
            }
        },
        [onSearch, handleSearchClose]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(searchQuery);
        } else if (e.key === 'Escape') {
            handleSearchClose();
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="px-4 flex h-14 items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Logo />
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            asChild
                        >
                            <Link href="/cart">
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        </Button>

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {isSearchOpen && (
                <>
                    <button
                        className="fixed inset-0 z-40 bg-black/50 mt-14"
                        onClick={handleSearchClose}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') handleSearchClose();
                        }}
                        aria-label="Fechar busca"
                    />
                    <div className="bg-background w-full p-4 space-y-4 fixed top-14 left-0 right-0 z-40">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Buscar produtos
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSearchClose}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Busque produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <Button
                                onClick={() => handleSearch(searchQuery)}
                                className="w-full"
                            >
                                Buscar
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {isMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        className="fixed inset-0 bg-black/50"
                        onClick={handleMenuClose}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') handleMenuClose();
                        }}
                        aria-label="Fechar menu lateral"
                    />
                    <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
                        <div className="flex h-full flex-col">
                            <div className="flex h-14 items-center justify-between border-b px-6">
                                <Logo />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleMenuClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-auto py-6">
                                <div className="absolute top-20 right-4 z-10">
                                    <ThemeToggle />
                                </div>
                                <nav className="space-y-1 px-3">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={handleMenuClose}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start gap-3"
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="border-t p-3">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3"
                                    asChild
                                    onClick={handleMenuClose}
                                >
                                    <Link href="/admin/login">
                                        <LogOut className="h-4 w-4" />
                                        Admin
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
