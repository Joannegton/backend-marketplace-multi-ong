'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/forms/product-form';

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as string;

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold">
                            Editar Produto
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                <div className="max-w-2xl w-full">
                    <ProductForm productId={productId} />
                </div>
            </div>
        </div>
    );
}
