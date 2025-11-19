import { NotFoundException } from '@nestjs/common';
import { DeleteCartUseCase } from './delete-cart.usecase';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('DeleteCartUseCase', () => {
  let usecase: DeleteCartUseCase;
  let cartRepository: any;

  beforeEach(() => {
    cartRepository = { findById: jest.fn(), delete: jest.fn() };
    usecase = new DeleteCartUseCase(cartRepository as any);
  });

  it('throws InvalidPropsException when cartId is not provided', async () => {
    await expect(usecase.execute('')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws NotFoundException when cart not found', async () => {
    cartRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('clears and deletes cart when found', async () => {
    const cart = { clear: jest.fn() };
    cartRepository.findById.mockResolvedValue(cart);
    await usecase.execute('id');
    expect(cart.clear).toHaveBeenCalled();
    expect(cartRepository.delete).toHaveBeenCalledWith('id');
  });
});
