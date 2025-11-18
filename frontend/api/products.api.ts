import { apiRequest } from '@/lib/api';
import {
    CreateProductData,
    Product,
    SearchProductsParams,
    SearchProductResponse,
    UpdateProductData,
    CatalogProduct,
} from '@/lib/types';

export const productsApi = {
    createProduct: async (data: CreateProductData): Promise<Product> => {
        const response = await apiRequest.post<Product>('/products', {
            body: data,
        });
        if (response.status === 409) {
            throw new Error('Produto já existe');
        } else if (response.status !== 201) {
            throw new Error('Erro ao criar produto');
        }
        return response.data;
    },

    findOrganizationProducts: async (): Promise<Product[]> => {
        const response = await apiRequest.get<Product[]>(
            '/products/organization'
        );
        if (response.status !== 200) {
            throw new Error('Erro ao buscar produtos');
        }
        return response.data;
    },

    getProduct: async (productId: string): Promise<Product> => {
        const response = await apiRequest.get<Product>(
            `/products/${productId}`
        );
        if (response.status !== 200) {
            throw new Error('Erro ao buscar produto');
        }
        return response.data;
    },

    getProductsIds: async (productIds: string[]): Promise<Product[]> => {
        const queryParamms = new URLSearchParams();
        for (const id of productIds) {
            queryParamms.append('ids', id);
        }

        const response = await apiRequest.get<Product[]>(
            `/products/by-ids?${queryParamms.toString()}`
        );
        if (response.status !== 200) {
            throw new Error('Erro ao buscar produto');
        }
        return response.data;
    },

    getOrganizationProduct: async (productId: string): Promise<Product> => {
        const response = await apiRequest.get<Product>(
            `/products/organization/${productId}`
        );
        if (response.status !== 200) {
            throw new Error('Erro ao buscar produto');
        }
        return response.data;
    },

    getCatalogProducts: async (
        limit?: number,
        offset?: number
    ): Promise<CatalogProduct> => {
        const response = await apiRequest.get<CatalogProduct>(
            `/products/catalog?limit=${limit}&offset=${offset}`
        );
        if (response.status !== 200) {
            throw new Error('Erro ao buscar produtos');
        }
        return response.data;
    },

    search: async (
        data: SearchProductsParams
    ): Promise<SearchProductResponse> => {
        const params = new URLSearchParams();

        if (data.query) params.append('query', data.query);
        if (data.minPrice !== undefined)
            params.append('minPrice', data.minPrice.toString());
        if (data.maxPrice !== undefined)
            params.append('maxPrice', data.maxPrice.toString());
        if (data.category) params.append('category', data.category);
        if (data.limit !== undefined)
            params.append('limit', data.limit.toString());
        if (data.offset !== undefined)
            params.append('offset', data.offset.toString());

        const queryString = params.toString();
        const url = queryString
            ? `/products/search?${queryString}`
            : '/products/search';

        const response = await apiRequest.get<SearchProductResponse>(url);
        if (response.status !== 200) {
            throw new Error('Erro ao buscar produtos');
        }
        return response.data;
    },

    updateProduct: async (data: UpdateProductData): Promise<Product> => {
        const { id, ...updateData } = data;
        const response = await apiRequest.patch<Product>(`/products/${id}`, {
            body: updateData,
        });
        if (response.status === 409) {
            throw new Error('Produto com esses dados já existe');
        } else if (response.status !== 200) {
            throw new Error('Erro ao atualizar produto');
        }
        return response.data;
    },

    toggleProductStatus: async ({
        productId,
    }: {
        productId: string;
    }): Promise<void> => {
        const response = await apiRequest.patch(
            `/products/${productId}/toggle-status`
        );
        if (response.status !== 200) {
            throw new Error('Erro ao atualizar status do produto');
        }
    },
    deleteProduct: async (productId: string): Promise<void> => {
        const response = await apiRequest.delete(`/products/${productId}`);
        if (response.status !== 200) {
            throw new Error('Erro ao excluir produto');
        }
    },
};
