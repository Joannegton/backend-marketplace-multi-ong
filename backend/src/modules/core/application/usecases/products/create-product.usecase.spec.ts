import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.usecase';

describe('CreateProductUseCase', () => {
  let usecase: CreateProductUseCase;
  let productRepository: any;
  let cacheService: any;

  beforeEach(() => {
    productRepository = { findByNameAndOrganizationId: jest.fn(), save: jest.fn() };
    cacheService = { invalidateAllProductCaches: jest.fn() };
    usecase = new CreateProductUseCase(productRepository as any, cacheService as any);
  });

  it('throws when organizationId missing', async () => {
    await expect(usecase.execute({ organizationId: '', name: 'n', description: 'd', price: 1, weight: 1, stock: 1, imageUrl: undefined, category: 'c' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when product with same name exists', async () => {
    productRepository.findByNameAndOrganizationId.mockResolvedValue(true);
    await expect(usecase.execute({ organizationId: 'o', name: 'n', description: 'd', price: 1, weight: 1, stock: 1, imageUrl: undefined, category: 'c' } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates product and invalidates cache', async () => {
    productRepository.findByNameAndOrganizationId.mockResolvedValue(null);
    const product: any = { toDto: () => ({ name: 'n' }) };
    productRepository.save.mockResolvedValue(product);

    const dto = await usecase.execute({ organizationId: 'o', name: 'n', description: 'd', price: 5, weight: 1, stock: 3, imageUrl: undefined, category: 'c' } as any);

    expect(dto.name).toBe('n');
    expect(cacheService.invalidateAllProductCaches).toHaveBeenCalledWith('o');
  });
});
