'use client';

import { useState } from 'react';
import { SearchInput } from '@/components/atoms/search-input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { SearchProductsParams } from '@/lib/types';
import { useProductStore } from '@/store/products.store';

interface FiltersSidebarProps {
    onSearch: (query: SearchProductsParams) => void;
}

export interface FilterState {
    category: string;
    priceRange: [number, number];
}

export function FiltersSidebar({ onSearch }: Readonly<FiltersSidebarProps>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

    const categories = useProductStore((state) => state.categories);

    const handleSearch = (query: string) => {
        const filters: SearchProductsParams = {
            query: query || undefined,
            category: category === 'all' ? undefined : category,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        };
        onSearch(filters);
    };

    const handleApplyFilters = () => {
        const filters: SearchProductsParams = {
            query: searchQuery || undefined,
            category: category === 'all' ? undefined : category,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        };

        onSearch(filters);
    };

    return (
        <aside className="w-full lg:w-64 space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-5">
                <div>
                    <SearchInput
                        placeholder="Digite para buscar..."
                        externalValue={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                    />
                </div>

                <div>
                    <h3 className="font-semibold mb-3">Categoria</h3>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div
                                key={cat}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="radio"
                                    value={cat}
                                    checked={category === cat}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    id={cat}
                                    className="w-4 h-4"
                                />
                                <label htmlFor={cat} className="cursor-pointer">
                                    {cat}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-4">Faixa de Preço</h3>
                    <div className="space-y-4">
                        <Slider
                            value={priceRange}
                            onValueChange={(value) =>
                                setPriceRange([value[0], value[1]] as [
                                    number,
                                    number,
                                ])
                            }
                            max={500}
                            step={10}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>R$ {priceRange[0]}</span>
                            <span>R$ {priceRange[1]}</span>
                        </div>
                    </div>
                </div>

                <Button onClick={handleApplyFilters} className="w-full">
                    Aplicar Filtros
                </Button>
            </div>
        </aside>
    );
}
