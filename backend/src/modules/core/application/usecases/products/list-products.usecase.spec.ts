import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { ListProductsUseCase } from './list-products.usecase';

describe('ListProductsUseCase', () => {
  let usecase: ListProductsUseCase;
  let productRepository: any;
  let cacheService: any;

  beforeEach(() => {
    productRepository = { findAllByOrganizationId: jest.fn(), findAll: jest.fn() };
    cacheService = { getOrgProducts: jest.fn(), setOrgProducts: jest.fn(), getCatalog: jest.fn(), setCatalog: jest.fn() };
    usecase = new ListProductsUseCase(productRepository as any, cacheService as any);
  });

  it('throws when organizationId missing', async () => {
    await expect(usecase.execute('')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('returns cached products when present', async () => {
    cacheService.getOrgProducts.mockResolvedValue([{ id: '1' }]);
    const res = await usecase.execute('org');
    expect(res).toEqual([{ id: '1' }]);
  });

  it('returns products from repository and sets cache', async () => {
    cacheService.getOrgProducts.mockResolvedValue(null);
    productRepository.findAllByOrganizationId.mockResolvedValue([{ toDto: () => ({ id: '2' }) }]);
    const res = await usecase.execute('org');
    expect(res).toEqual([{ id: '2' }]);
    expect(cacheService.setOrgProducts).toHaveBeenCalled();
  });

  it('executeCatalog uses defaults and caches result', async () => {
    cacheService.getCatalog.mockResolvedValue(null);
    productRepository.findAll.mockResolvedValue([{ toDto: () => ({ id: 'p1' }) }]);
    const res = await usecase.executeCatalog(0, -1);
    expect(res.pagination.limit).toBeGreaterThan(0);
    expect(cacheService.setCatalog).toHaveBeenCalled();
  });
});
