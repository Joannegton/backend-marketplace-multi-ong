import { AddItemToCartUseCase } from 'src/modules/core/application/usecases/cart/add-item-to-cart.usecase';
import { InventoryReconciliationProcessor } from 'src/modules/core/infra/services/processors/inventory-reconciliation.processor';

// Mocks
const mockProduct = {
    id: 'prod-1',
    name: 'Product 1',
    organizationId: 'org-1',
    price: 100,
    stock: 10,
    reservedStock: 0,
    isActive: true,
    releaseReservation(quantity: number) {
        this.reservedStock -= quantity;
    },
    reserveStock(quantity: number) {
        this.reservedStock += quantity;
    },
    confirmReservedStock(quantity: number) {
        this.reservedStock -= quantity;
        this.stock -= quantity;
    },
    canReserveStock(quantity: number) {
        return this.stock - this.reservedStock >= quantity;
    },
    getAvailableStock() {
        return this.stock - this.reservedStock;
    },
};

describe('Reconciliation flow (simulated)', () => {
    test('AddItemToCartUseCase enqueues reconcile job when Redis reserve fails', async () => {
        const cartRepo: any = {
            findById: jest.fn().mockResolvedValue(null),
            saveWithQueryRunner: jest
                .fn()
                .mockImplementation(async (cart: any) => cart),
        };

        const productRepo: any = {
            findByIdWithLock: jest
                .fn()
                .mockResolvedValueOnce({
                    ...mockProduct,
                    releaseReservation: mockProduct.releaseReservation,
                    reserveStock: mockProduct.reserveStock,
                })
                .mockRejectedValue(new Error('db revert fail')),
            saveWithQueryRunner: jest.fn().mockResolvedValue(undefined),
        };

        const reservationService: any = {
            reserveStock: jest.fn().mockRejectedValue(new Error('redis down')),
        };

        const ordersQueue: any = {
            add: jest.fn().mockResolvedValue(true),
            client: {},
        };

        const dataSource: any = {
            createQueryRunner: jest.fn().mockReturnValue({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    save: jest.fn(),
                },
            }),
        };

        const logger: any = { error: jest.fn(), info: jest.fn() };

        const configService: any = { get: jest.fn().mockReturnValue(20) };

        const usecase = new AddItemToCartUseCase(
            cartRepo,
            productRepo,
            reservationService,
            ordersQueue,
            dataSource,
            logger,
            configService,
        );

        // Act
        await expect(
            usecase.execute({ productId: 'prod-1', quantity: 1 }),
        ).rejects.toThrow(
            'Failed to reserve stock in cache; operation aborted',
        );

        expect(ordersQueue.add).toHaveBeenCalled();
        const [jobName, payload] = ordersQueue.add.mock.calls[0];
        expect(jobName).toBe('reconcile-inventory');
        expect(payload.productId).toBe('prod-1');
    });

    test('InventoryReconciliationProcessor applies reservedStock release', async () => {
        const productRepo: any = {
            findByIdWithLock: jest.fn().mockResolvedValue({
                ...mockProduct,
                releaseReservation(quantity: number) {
                    this.reservedStock -= quantity;
                },
            }),
            saveWithQueryRunner: jest.fn().mockResolvedValue(undefined),
        };

        const logger: any = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        const queryRunnerMock = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
        };
        const dataSource: any = {
            createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
        };

        const processor = new InventoryReconciliationProcessor(
            productRepo,
            logger,
            dataSource,
        );

        const job: any = {
            data: {
                productId: 'prod-1',
                cartId: 'cart-1',
                quantity: 2,
                reason: 'test',
            },
        };

        // Act
        await processor.handleReconcile(job);

        expect(productRepo.findByIdWithLock).toHaveBeenCalledWith(
            'prod-1',
            queryRunnerMock,
        );
        expect(productRepo.saveWithQueryRunner).toHaveBeenCalled();
    });
});
