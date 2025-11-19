import { ProductCacheService } from './product-cache.service';

describe('ProductCacheService', () => {
  let service: ProductCacheService;
  let queue: any;
  let configService: any;
  let logger: any;

  beforeEach(() => {
    const client = {
      setex: jest.fn(),
      get: jest.fn(),
      keys: jest.fn(),
      del: jest.fn(),
    };
    queue = { client };
    configService = { get: jest.fn().mockReturnValue(1) };
    logger = { debug: jest.fn(), info: jest.fn(), error: jest.fn() };
    service = new ProductCacheService(queue as any, configService as any, logger as any);
  });

  it('sets and gets catalog', async () => {
    const data = { results: [], pagination: { limit: 1, offset: 0, total: 0, hasMore: false } };
    queue.client.get.mockResolvedValue(JSON.stringify(data));
    const res = await service.getCatalog(1, 0);
    expect(res).toEqual(data);
  });

  it('returns null when catalog not cached', async () => {
    queue.client.get.mockResolvedValue(null);
    const res = await service.getCatalog(1, 0);
    expect(res).toBeNull();
  });

  it('sets and gets search', async () => {
    const data = { query: '', enhancedQuery: '', results: [], pagination: { limit: 1, offset: 0, total: 0, hasMore: false } };
    queue.client.get.mockResolvedValue(JSON.stringify(data));
    const res = await service.getSearch('k');
    expect(res).toEqual(data);
  });

  it('sets and gets org products', async () => {
    const products = [{ toDto: () => ({ id: '1' }) }];
    queue.client.get.mockResolvedValue(JSON.stringify(products.map(p => p.toDto())));
    const res = await service.getOrgProducts('org');
    expect(res).toEqual([{ id: '1' }]);
  });

  it('invalidates caches', async () => {
    queue.client.keys.mockResolvedValue(['a', 'b']);
    queue.client.del.mockResolvedValue(2);
    await service.invalidateCatalog();
    expect(queue.client.keys).toHaveBeenCalled();
    await service.invalidateSearches();
    expect(queue.client.keys).toHaveBeenCalled();
    await service.invalidateOrgProducts('org');
    expect(queue.client.del).toHaveBeenCalled();
    await service.invalidateAllProductCaches('org');
    expect(queue.client.del).toHaveBeenCalled();
  });
});
