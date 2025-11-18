import Link from 'next/link';

interface LogoProps {
    href?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Logo({ href = '/', size = 'md' }: Readonly<LogoProps>) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
    };
    return (
        <Link
            href={href}
            className={`font-bold ${sizeClasses[size]} hover:opacity-80 transition-opacity`}
        >
            <span className="text-foreground">ONG</span>
            <span className="text-accent">MARKKET</span>
        </Link>
    );
}
