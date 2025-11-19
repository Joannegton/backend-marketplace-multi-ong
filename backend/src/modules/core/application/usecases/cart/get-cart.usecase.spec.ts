import { NotFoundException } from '@nestjs/common';
import { GetCartUseCase } from './get-cart.usecase';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('GetCartUseCase', () => {
  let usecase: GetCartUseCase;
  let cartRepository: any;

  beforeEach(() => {
    cartRepository = { findById: jest.fn() };
    usecase = new GetCartUseCase(cartRepository as any);
  });

  it('throws InvalidPropsException when cartId is empty', async () => {
    await expect(usecase.execute('')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws NotFoundException when cart not found', async () => {
    cartRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns cart dto when found', async () => {
    const cart = { toDto: () => ({ id: '1' }) };
    cartRepository.findById.mockResolvedValue(cart);
    const dto = await usecase.execute('1');
    expect(dto).toEqual({ id: '1' });
  });
});
