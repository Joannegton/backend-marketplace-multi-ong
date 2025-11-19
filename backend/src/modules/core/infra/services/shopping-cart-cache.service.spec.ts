import { ShoppingCartCacheService } from './shopping-cart-cache.service';
import { ShoppingCart } from '../../domain/shopping-cart';
import { ShoppingCartMapper } from '../mappers/shopping-cart.mapper';

describe('ShoppingCartCacheService', () => {
  let service: ShoppingCartCacheService;
  let queue: any;
  let cartRepository: any;
  let productRepository: any;
  let configService: any;
  let logger: any;

  beforeEach(() => {
    const client = { setex: jest.fn(), get: jest.fn(), del: jest.fn(), exists: jest.fn(), keys: jest.fn() };
    queue = { client, add: jest.fn() };
    cartRepository = { findOne: jest.fn() };
    productRepository = { findByIds: jest.fn() };
    configService = { get: jest.fn().mockReturnValue(1) };
    logger = { error: jest.fn(), warn: jest.fn() };

    service = new ShoppingCartCacheService(queue as any, cartRepository as any, productRepository as any, configService as any, logger as any);
  });

  it('saves cart to redis and enqueues persist job', async () => {
    const cart = ShoppingCart.create(20);
    await service.save(cart);
    expect(queue.client.setex).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalled();
  });

  it('finds cart from cache and maps to domain', async () => {
    const cart = ShoppingCart.create(20);
    const cached = { id: cart.id, items: [], status: cart.status, expiresAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() };
    queue.client.get.mockResolvedValue(JSON.stringify(cached));
    productRepository.findByIds.mockResolvedValue([]);
    jest.spyOn(ShoppingCartMapper, 'toDomain').mockReturnValue(cart as any);

    const res = await service.findById(cart.id);
    expect(res).toBeInstanceOf(ShoppingCart);
  });

  it('deletes cart from cache and enqueues delete job', async () => {
    await service.delete('id');
    expect(queue.client.del).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalled();
  });

  it('exists returns true when redis says so', async () => {
    queue.client.exists.mockResolvedValue(1);
    const res = await service.exists('id');
    expect(res).toBe(true);
  });

  it('getAllFromCache returns mapped carts', async () => {
    const cart = ShoppingCart.create(20);
    const cached = { id: cart.id, items: [], status: cart.status, expiresAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() };
    queue.client.keys.mockResolvedValue(['cart:1']);
    queue.client.get.mockResolvedValue(JSON.stringify(cached));
    productRepository.findByIds.mockResolvedValue([]);
    jest.spyOn(ShoppingCartMapper, 'toDomain').mockReturnValue(cart as any);

    const res = await service.getAllFromCache();
    expect(Array.isArray(res)).toBe(true);
  });
});
