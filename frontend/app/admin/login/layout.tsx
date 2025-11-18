import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ONGMarket - Login Administrativo',
    description: 'Acesso administrativo do marketplace',
};

export default function AdminLoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
