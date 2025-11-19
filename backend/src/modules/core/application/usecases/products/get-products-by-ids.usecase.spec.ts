import { GetProductsByIdsUseCase } from './get-products-by-ids.usecase';

describe('GetProductsByIdsUseCase', () => {
  let usecase: GetProductsByIdsUseCase;
  let productRepository: any;

  beforeEach(() => {
    productRepository = { findByIds: jest.fn() };
    usecase = new GetProductsByIdsUseCase(productRepository as any);
  });

  it('returns empty for empty ids', async () => {
    const res = await usecase.execute([]);
    expect(res).toEqual([]);
  });

  it('maps found products to dto', async () => {
    productRepository.findByIds.mockResolvedValue([{ toDto: () => ({ id: '1' }) }]);
    const res = await usecase.execute(['1']);
    expect(res).toEqual([{ id: '1' }]);
  });
});
