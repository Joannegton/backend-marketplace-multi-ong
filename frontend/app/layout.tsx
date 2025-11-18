import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppInitializer } from '@/components/app-initializer';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'ONGMarket - Marketplace de Produtos de ONGs',
    description: 'Conectando clientes com produtos de ONGs parceiras',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={inter.variable}>
            <body
                className={'font-sans antialiased'}
                suppressHydrationWarning={true}
            >
                <Providers>
                    <AppInitializer />
                    <div className="min-h-screen bg-background">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
