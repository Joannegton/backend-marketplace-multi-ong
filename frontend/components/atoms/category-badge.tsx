import { Badge } from './badge';

const categoryColors: Record<
    string,
    'default' | 'secondary' | 'success' | 'warning'
> = {
    artesanato: 'default',
    alimentos: 'success',
    vestuario: 'warning',
    outros: 'secondary',
};

interface CategoryBadgeProps {
    category: string;
}

export function CategoryBadge({ category }: Readonly<CategoryBadgeProps>) {
    const variant = categoryColors[category.toLowerCase()] || 'secondary';

    return <Badge variant={variant}>{category}</Badge>;
}
