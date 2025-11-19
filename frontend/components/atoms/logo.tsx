import Link from 'next/link';

interface LogoProps {
    href?: string | null;
    size?: 'sm' | 'md' | 'lg';
}

export function Logo({ href = '/', size = 'md' }: Readonly<LogoProps>) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
    };
    const className = `font-bold ${sizeClasses[size]} hover:opacity-80 transition-opacity`;
    if (!href) {
        return (
            <span className={className}>
                <span className="text-foreground">ONG</span>
                <span className="text-accent">MARKKET</span>
            </span>
        );
    }
    return (
        <Link href={href} className={className}>
            <span className="text-foreground">ONG</span>
            <span className="text-accent">MARKKET</span>
        </Link>
    );
}
