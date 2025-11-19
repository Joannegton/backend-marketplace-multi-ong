import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FindProductUseCase } from './find-product.usecase';

describe('FindProductUseCase', () => {
  let usecase: FindProductUseCase;
  let productRepository: any;

  beforeEach(() => {
    productRepository = { findByIdAndOrganizationId: jest.fn() };
    usecase = new FindProductUseCase(productRepository as any);
  });

  it('throws when params missing', async () => {
    await expect(usecase.execute({ id: '', organizationId: '' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when product not found', async () => {
    productRepository.findByIdAndOrganizationId.mockResolvedValue(null);
    await expect(usecase.execute({ id: '1', organizationId: 'o' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns dto when found', async () => {
    productRepository.findByIdAndOrganizationId.mockResolvedValue({ toDto: () => ({ id: '1' }) });
    const dto = await usecase.execute({ id: '1', organizationId: 'o' } as any);
    expect(dto).toEqual({ id: '1' });
  });
});
