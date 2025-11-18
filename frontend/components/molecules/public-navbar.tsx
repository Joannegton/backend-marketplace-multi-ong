'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/atoms/logo';
import { SearchInput } from '@/components/atoms/search-input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useShoppingCartStore } from '@/store/cart.store';

interface PublicNavbarProps {
    onSearch?: (query: string) => void;
}

export function PublicNavbar({ onSearch }: Readonly<PublicNavbarProps>) {
    const { shoppingCart } = useShoppingCartStore();
    const cartItemCount = shoppingCart?.items?.length ?? 0;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 md:px-8 flex h-16 items-center gap-4">
                <Logo />
                <div className="flex-1 max-w-xl">
                    <SearchInput
                        placeholder="Busque produtos ou digite algo como 'doces até 50 reais'..."
                        onSearch={onSearch}
                    />
                </div>
                <nav className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/login">Admin</Link>
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
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </Button>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
