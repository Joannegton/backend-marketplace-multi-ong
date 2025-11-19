import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CheckoutPaymentUseCase } from './checkout.usecase';

describe('CheckoutPaymentUseCase', () => {
  let usecase: CheckoutPaymentUseCase;
  let orderRepository: any;
  let ordersQueue: any;
  let logger: any;

  beforeEach(() => {
    orderRepository = { findById: jest.fn(), save: jest.fn() };
    ordersQueue = { add: jest.fn() };
    logger = { info: jest.fn(), error: jest.fn() };

    usecase = new CheckoutPaymentUseCase(
      orderRepository,
      logger as any,
      ordersQueue as any,
    );
  });

  it('throws NotFoundException when order not found', async () => {
    orderRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('1', { paymentProvider: 'p' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when order status is not PENDING', async () => {
    const order = { id: '1', status: 'PROCESSING' };
    orderRepository.findById.mockResolvedValue(order);
    await expect(usecase.execute('1', { paymentProvider: 'p' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('processes payment and queues job', async () => {
    const order = {
      id: '1',
      status: 'pending',
      total: 100,
      organizationIds: ['o1'],
      updateStatus(status: string) { this.status = status; },
      toDto() { return { id: this.id, status: this.status, total: this.total }; },
    };

    orderRepository.findById.mockResolvedValue(order);
    orderRepository.save.mockResolvedValue(order);

    const dto = await usecase.execute('1', { paymentProvider: 'stripe', paymentToken: 't', reference: 'r' } as any);

    expect(dto.id).toBe('1');
    expect(ordersQueue.add).toHaveBeenCalled();
  });
});
