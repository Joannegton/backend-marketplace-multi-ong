import { SearchProductsUseCase } from './search-products.usecase';


describe('SearchProductsUseCase', () => {
  let usecase: SearchProductsUseCase;
  let productRepository: any;
  let openAiService: any;
  let cacheService: any;
  let logger: any;

  beforeEach(() => {
    productRepository = { search: jest.fn() };
    openAiService = { enhanceQuery: jest.fn() };
    cacheService = { generateSearchKey: jest.fn().mockReturnValue('k'), getSearch: jest.fn(), setSearch: jest.fn() };
    logger = { info: jest.fn(), debug: jest.fn(), warn: jest.fn() };
    usecase = new SearchProductsUseCase(productRepository as any, openAiService as any, cacheService as any, logger as any);
  });

  it('returns cached result when present', async () => {
    cacheService.getSearch.mockResolvedValue({ query: 'q', enhancedQuery: '', results: [], pagination: { limit: 10, offset: 0, total: 0, hasMore: false } });
    const res = await usecase.execute({ query: 'q' } as any);
    expect(res.query).toBe('q');
    expect(logger.debug).toHaveBeenCalled();
  });

  it('uses AI path when query provided and succeeds', async () => {
    cacheService.getSearch.mockResolvedValue(null);
    openAiService.enhanceQuery.mockResolvedValue('enhanced');
    const product: any = { toDto: () => ({ id: 'p1' }), __total__: 1 };
    productRepository.search.mockResolvedValue([product]);

    const res = await usecase.execute({ query: 'q', limit: 1, offset: 0 } as any);
    expect(res.enhancedQuery).toBe('enhanced');
    expect(cacheService.setSearch).toHaveBeenCalled();
  });

  it('falls back to filters when AI fails', async () => {
    cacheService.getSearch.mockResolvedValue(null);
    openAiService.enhanceQuery.mockRejectedValue(new Error('ai fail'));
    const product: any = { toDto: () => ({ id: 'p1' }), __total__: 1 };
    productRepository.search.mockResolvedValue([product]);

    const res = await usecase.execute({ query: 'q', limit: 1, offset: 0 } as any);
    expect(res.query).toBe('q');
    expect(logger.warn).toHaveBeenCalled();
  });

  it('uses filter path when no query provided', async () => {
    cacheService.getSearch.mockResolvedValue(null);
    const product: any = { toDto: () => ({ id: 'p1' }), __total__: 1 };
    productRepository.search.mockResolvedValue([product]);
    const res = await usecase.execute({ query: '', limit: 1, offset: 0 } as any);
    expect(res.query).toBe('');
    expect(cacheService.setSearch).toHaveBeenCalled();
  });
});
