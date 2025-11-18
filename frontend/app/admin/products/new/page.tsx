'use client';

import { ProductForm } from '@/components/forms/product-form';

export default function NewProductPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    <h1 className="text-xl font-semibold">Novo Produto</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                <div className="max-w-2xl w-full">
                    <ProductForm />
                </div>
            </div>
        </div>
    );
}
