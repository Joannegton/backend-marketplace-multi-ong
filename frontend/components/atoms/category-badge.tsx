import { Badge } from "./badge";
import { PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/lib/types";

const categoryColors: Record<
  ProductCategory,
  "default" | "secondary" | "success" | "warning"
> = {
  artesanato: "default",
  vestuario: "warning",
  casa: "secondary",
  acessorios: "success",
  infantil: "secondary",
  outros: "secondary",
};

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: Readonly<CategoryBadgeProps>) {
  const key = (category || "").toLowerCase() as ProductCategory;
  const variant = categoryColors[key] || "secondary";
  const label = PRODUCT_CATEGORY_LABELS[key] ?? category;

  return <Badge variant={variant}>{label}</Badge>;
}
