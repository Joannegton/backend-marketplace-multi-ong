import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SearchInputProps {
    placeholder?: string;
    externalValue?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    className?: string;
}

export function SearchInput({
    placeholder = 'Buscar produtos...',
    externalValue,
    onChange,
    onSearch,
    className,
}: Readonly<SearchInputProps>) {
    const [internalValue, setInternalValue] = useState('');
    const value = externalValue ?? internalValue;

    const handleChange = (newValue: string) => {
        setInternalValue(newValue);
        onChange?.(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch?.(value);
        }
    };

    const handleSearchClick = () => {
        onSearch?.(value);
    };

    return (
        <div className="relative w-full">
            <Input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`pr-9 ${className}`}
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                onClick={handleSearchClick}
            >
                <Search className="h-4 w-4" />
            </Button>
        </div>
    );
}
