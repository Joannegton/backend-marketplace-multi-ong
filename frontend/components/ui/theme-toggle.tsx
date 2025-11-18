'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="h-4 w-4 text-orange-500" />;
            case 'dark':
                return <Moon className="h-4 w-4 text-orange-400" />;
            case 'system':
                return <Sun className="h-4 w-4 opacity-50 text-orange-300" />;
            default:
                return <Sun className="h-4 w-4 text-orange-500" />;
        }
    };
    const getLabel = () => {
        switch (theme) {
            case 'light':
                return 'Modo claro';
            case 'dark':
                return 'Modo escuro';
            case 'system':
                return 'Sistema';
            default:
                return 'Tema';
        }
    };

    // Só renderiza após a hidratação para evitar mismatch
    if (!mounted) {
        return (
            <Button variant="outline" size="sm" className="gap-2" title="Tema">
                <Sun className="h-4 w-4 text-orange-500" />
                <span className="hidden sm:inline">Tema</span>
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
            title={getLabel()}
        >
            {getIcon()}
            <span className="hidden sm:inline">{getLabel()}</span>
        </Button>
    );
}
