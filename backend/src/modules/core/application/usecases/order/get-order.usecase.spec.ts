import { NotFoundException } from '@nestjs/common';
import { GetOrderUseCase } from './get-order.usecase';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('GetOrderUseCase', () => {
  let usecase: GetOrderUseCase;
  let orderRepository: any;

  beforeEach(() => {
    orderRepository = { findById: jest.fn() };
    usecase = new GetOrderUseCase(orderRepository as any);
  });

  it('throws when orderId is empty', async () => {
    await expect(usecase.execute('')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws when order not found', async () => {
    orderRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns dto when found', async () => {
    const order = { toDto: () => ({ id: '1' }) };
    orderRepository.findById.mockResolvedValue(order);
    const dto = await usecase.execute('1');
    expect(dto).toEqual({ id: '1' });
  });
});
