import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GetOrderByCpfUseCase } from './get-order-by-cpf.usecase';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('GetOrderByCpfUseCase', () => {
  let usecase: GetOrderByCpfUseCase;
  let orderRepository: any;

  beforeEach(() => {
    orderRepository = { findById: jest.fn() };
    usecase = new GetOrderByCpfUseCase(orderRepository as any);
  });

  it('throws when orderId missing', async () => {
    await expect(usecase.execute('', 'cpf')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws when cpf missing', async () => {
    await expect(usecase.execute('1', '')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws when order not found', async () => {
    orderRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('1', 'cpf')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when cpf does not match', async () => {
    const order = { cliente: { cpf: 'other' } };
    orderRepository.findById.mockResolvedValue(order);
    await expect(usecase.execute('1', 'cpf')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns dto when cpf matches', async () => {
    const order = { cliente: { cpf: 'cpf' }, toDto: () => ({ id: '1' }) };
    orderRepository.findById.mockResolvedValue(order);
    const dto = await usecase.execute('1', 'cpf');
    expect(dto).toEqual({ id: '1' });
  });
});
