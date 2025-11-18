import { orderApi } from '@/api/orders.api';
import { CheckoutPaymentDto, CreateOrderDto } from '@/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const DEZ_MINUTOS = 10 * 60 * 1000;
const CINCO_MINUTOS = 5 * 60 * 1000;

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: async (dto: CreateOrderDto) =>
            await orderApi.createOrder(dto),
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useCheckoutPayment = () => {
    return useMutation({
        mutationFn: async ({
            orderId,
            dto,
        }: {
            orderId: string;
            dto: CheckoutPaymentDto;
        }) => await orderApi.checkoutPayment(orderId, dto),
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useOrganizationOrders = () => {
    return useQuery({
        queryKey: ['orders', 'organization'],
        queryFn: async () => orderApi.findOrdersOrganization(),
        staleTime: CINCO_MINUTOS,
        gcTime: DEZ_MINUTOS,
    });
};

export const useOrderByIdAndOrganization = (id: string) => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: async () => orderApi.findOrderByIdAndOrganization(id),
        staleTime: CINCO_MINUTOS,
        gcTime: DEZ_MINUTOS,
        enabled: !!id,
    });
};

export const useOrderByIdAndCpf = (orderId: string, cpf: string) => {
    return useQuery({
        queryKey: ['orders', orderId, cpf],
        queryFn: async () => orderApi.findOrderByCpf(orderId, cpf),
        staleTime: CINCO_MINUTOS,
        gcTime: DEZ_MINUTOS,
        enabled: !!orderId && !!cpf,
    });
};
