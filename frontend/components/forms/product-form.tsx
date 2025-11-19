"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useCreateProduct,
  useUpdateProduct,
  useGetOrganizationProduct,
} from "@/hooks/products.hook";
import {
  CreateProductData,
  PRODUCT_CATEGORIES,
  UpdateProductData,
  PRODUCT_CATEGORY_LABELS,
  ProductCategory,
} from "@/lib/types";

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: Readonly<ProductFormProps>) {
  const router = useRouter();
  const isEdit = !!productId;

  const { data: product, isLoading } = useGetOrganizationProduct(
    productId || ""
  );
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const { register, handleSubmit, reset, formState, watch, setValue } =
    useForm<CreateProductData>({
      defaultValues: {
        name: "",
        description: "",
        price: 0,
        weight: 0,
        stock: 0,
        imageUrl: "",
        category: "",
      },
    });

  const { errors } = formState;

  const [weightDisplay, setWeightDisplay] = useState("");

  const categories = [...PRODUCT_CATEGORIES];

  useEffect(() => {
    if (isEdit && product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        weight: product.weight,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
      });
      const w = product.weight ?? 0;
      if (w >= 1000) {
        const kg = Math.floor(w / 1000);
        const g = String(w % 1000).padStart(3, "0");
        setWeightDisplay(`${kg},${g}`);
      } else {
        setWeightDisplay(String(w));
      }
    }
  }, [product, isEdit, reset]);

  const onSubmit = (data: CreateProductData) => {
    if (isEdit && productId) {
      const updateData: UpdateProductData = {
        id: productId,
        ...data,
      };
      updateMutation.mutate(updateData, {
        onSuccess: () => {
          router.push("/admin/products");
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          reset();
          router.push("/admin/products");
        },
      });
    }
  };

  if (isEdit && isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Produto" : "Novo Produto"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Atualize as informações do produto"
            : "Preencha os dados do novo produto"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              {...register("name", { required: "Nome é obrigatório" })}
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Descrição é obrigatória",
              })}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-600 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Preço deve ser maior que 0" },
                })}
              />
              {errors.price && (
                <p className="text-red-600 text-sm">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={watch("category") || undefined}
                onValueChange={(value: string) => setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {PRODUCT_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("category", {
                  required: "Categoria é obrigatória",
                })}
              />
              {errors.category && (
                <p className="text-red-600 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Quantidade em Estoque</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Estoque inválido" },
                })}
              />
              {errors.stock && (
                <p className="text-red-600 text-sm">{errors.stock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (gramas)</Label>
              <Input
                id="weight"
                type="text"
                value={weightDisplay}
                onChange={(e) => {
                  const v = e.target.value;
                  setWeightDisplay(v);
                  const parsed = (() => {
                    if (!v) return 0;
                    const s = v.toLowerCase().trim();
                    const kgMatch = s.match(/(\d+[.,]?\d*)\s*kg/);
                    const gMatch = s.match(/(\d+)\s*g/);
                    if (kgMatch) {
                      const kg = parseFloat(kgMatch[1].replace(",", ".")) || 0;
                      const g = gMatch ? parseInt(gMatch[1], 10) || 0 : 0;
                      return Math.round(kg * 1000) + g;
                    }
                    const combinedMatch = s.match(/^(\d+)[,\.](\d{1,3})$/);
                    if (combinedMatch) {
                      const whole = parseInt(combinedMatch[1], 10);
                      let frac = combinedMatch[2];
                      if (frac.length === 1) frac = frac + "00";
                      if (frac.length === 2) frac = frac + "0";
                      const grams = parseInt(frac.slice(0, 3), 10) || 0;
                      return whole * 1000 + grams;
                    }
                    const onlyNumber = s.replace(/[^0-9]/g, "");
                    if (/^[0-9]+$/.test(s)) {
                      const n = parseInt(s, 10);
                      return n;
                    }
                    if (onlyNumber && onlyNumber.length > 0)
                      return parseInt(onlyNumber, 10);
                    return 0;
                  })();
                  setValue("weight", parsed, { shouldValidate: true });
                }}
              />
              <input
                type="hidden"
                {...register("weight", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Peso inválido" },
                })}
              />
              {errors.weight && (
                <p className="text-red-600 text-sm">{errors.weight.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              {...register("imageUrl", {
                validate: (v) =>
                  !v || /^https?:\/\/.+/.test(v) || "URL inválida",
              })}
              placeholder="https://..."
            />
            {errors.imageUrl && (
              <p className="text-red-600 text-sm">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEdit ? "Atualizar Produto" : "Criar Produto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
