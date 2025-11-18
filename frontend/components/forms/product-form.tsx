'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    useCreateProduct,
    useUpdateProduct,
    useGetOrganizationProduct,
} from '@/hooks/products.hook';
import { CreateProductData, UpdateProductData } from '@/lib/types';

interface ProductFormProps {
    productId?: string;
}

export function ProductForm({ productId }: Readonly<ProductFormProps>) {
    const router = useRouter();
    const isEdit = !!productId;

    const { data: product, isLoading } = useGetOrganizationProduct(
        productId || ''
    );
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        description: '',
        price: 0,
        weight: 0,
        stock: 0,
        imageUrl: '',
        category: '',
    });

    useEffect(() => {
        if (isEdit && product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                weight: product.weight,
                stock: product.stock,
                imageUrl: product.imageUrl,
                category: product.category,
            });
        }
    }, [product, isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && productId) {
            const updateData: UpdateProductData = {
                id: productId,
                ...formData,
            };
            updateMutation.mutate(updateData, {
                onSuccess: () => {
                    router.push('/admin/products');
                },
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    setFormData({
                        name: '',
                        description: '',
                        price: 0,
                        weight: 0,
                        stock: 0,
                        imageUrl: '',
                        category: '',
                    });
                    router.push('/admin/products');
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
                <CardTitle>
                    {isEdit ? 'Editar Produto' : 'Novo Produto'}
                </CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Atualize as informações do produto'
                        : 'Preencha os dados do novo produto'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Produto</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price:
                                            Number.parseFloat(e.target.value) ||
                                            0,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: string) =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="artesanato">
                                        Artesanato
                                    </SelectItem>
                                    <SelectItem value="alimentos">
                                        Alimentos
                                    </SelectItem>
                                    <SelectItem value="vestuario">
                                        Vestuário
                                    </SelectItem>
                                    <SelectItem value="outros">
                                        Outros
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Quantidade em Estoque</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        stock:
                                            Number.parseInt(e.target.value) ||
                                            0,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="weight">Peso (gramas)</Label>
                            <Input
                                id="weight"
                                type="number"
                                value={formData.weight}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        weight:
                                            Number.parseInt(e.target.value) ||
                                            0,
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">URL da Imagem</Label>
                        <Input
                            id="image_url"
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    imageUrl: e.target.value,
                                })
                            }
                            placeholder="https://..."
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                            {isEdit ? 'Atualizar Produto' : 'Criar Produto'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/products')}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
