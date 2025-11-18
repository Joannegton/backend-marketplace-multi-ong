import { apiRequest } from '@/lib/api';
import {
    CheckoutPaymentDto,
    CreateOrderDto,
    Order,
    OrganizationOrder,
} from '@/lib/types';

export const orderApi = {
    createOrder: async (dto: CreateOrderDto): Promise<Order> => {
        const result = await apiRequest.post<Order>(`/orders`, {
            body: dto,
        });
        if (result.status !== 201) {
            throw new Error('Erro ao criar pedido');
        }

        return result.data;
    },

    checkoutPayment: async (
        orderId: string,
        dto: CheckoutPaymentDto
    ): Promise<OrganizationOrder> => {
        const result = await apiRequest.post<OrganizationOrder>(
            `/orders/${orderId}/checkout`,
            {
                body: dto,
            }
        );
        if (result.status !== 200) {
            throw new Error('Erro ao processar pagamento');
        }

        return result.data;
    },

    findOrdersOrganization: async (): Promise<OrganizationOrder[]> => {
        const result =
            await apiRequest.get<OrganizationOrder[]>(`/orders/organization`);
        if (result.status !== 200) {
            throw new Error('Erro ao buscar pedidos da organização');
        }

        return result.data;
    },

    findOrderByIdAndOrganization: async (
        id: string
    ): Promise<OrganizationOrder> => {
        const result = await apiRequest.get<OrganizationOrder>(
            `/orders/organization/${id}`
        );
        if (result.status !== 200) {
            throw new Error('Erro ao buscar pedido');
        }

        return result.data;
    },

    findOrderByCpf: async (
        orderId: string,
        cpf: string
    ): Promise<OrganizationOrder> => {
        const result = await apiRequest.get<OrganizationOrder>(
            `/orders/${orderId}?cpf=${cpf}`
        );
        if (result.status !== 200) {
            throw new Error('Erro ao buscar pedido');
        }

        return result.data;
    },
};
