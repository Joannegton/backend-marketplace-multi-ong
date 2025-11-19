import { NotFoundException } from '@nestjs/common';
import { DeleteProductUseCase } from './delete-product.usecase';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('DeleteProductUseCase', () => {
  let usecase: DeleteProductUseCase;
  let productRepository: any;
  let cacheService: any;

  beforeEach(() => {
    productRepository = { findByIdAndOrganizationId: jest.fn(), delete: jest.fn() };
    cacheService = { invalidateAllProductCaches: jest.fn() };
    usecase = new DeleteProductUseCase(productRepository as any, cacheService as any);
  });

  it('throws when params missing', async () => {
    await expect(usecase.execute('', '')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws when product not found', async () => {
    productRepository.findByIdAndOrganizationId.mockResolvedValue(null);
    await expect(usecase.execute('id', 'org')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes product and invalidates cache', async () => {
    productRepository.findByIdAndOrganizationId.mockResolvedValue({});
    await usecase.execute('id', 'org');
    expect(productRepository.delete).toHaveBeenCalledWith('id', 'org');
    expect(cacheService.invalidateAllProductCaches).toHaveBeenCalledWith('org');
  });
});
