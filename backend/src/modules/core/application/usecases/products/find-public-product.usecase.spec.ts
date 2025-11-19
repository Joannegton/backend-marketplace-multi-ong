import { NotFoundException } from '@nestjs/common';
import { FindPublicProductUseCase } from './find-public-product.usecase';

describe('FindPublicProductUseCase', () => {
  let usecase: FindPublicProductUseCase;
  let productRepository: any;

  beforeEach(() => {
    productRepository = { findById: jest.fn() };
    usecase = new FindPublicProductUseCase(productRepository as any);
  });

  it('throws when id missing', async () => {
    await expect(usecase.execute('')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when product not found', async () => {
    productRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when product is not active', async () => {
    productRepository.findById.mockResolvedValue({ isActive: false });
    await expect(usecase.execute('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns dto when product is active', async () => {
    productRepository.findById.mockResolvedValue({ isActive: true, toDto: () => ({ id: '1' }) });
    const dto = await usecase.execute('1');
    expect(dto).toEqual({ id: '1' });
  });
});
