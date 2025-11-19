import { ExpireShoppingCartsJob } from './expire-shopping-carts.job';
import { ShoppingCartStatus } from '../../domain/shopping-cart';

describe('ExpireShoppingCartsJob', () => {
  let job: ExpireShoppingCartsJob;
  let cartRepository: any;
  let productRepository: any;
  let logger: any;
  let dataSource: any;

  beforeEach(() => {
    cartRepository = { find: jest.fn(), save: jest.fn() };
    productRepository = { findByIdWithLock: jest.fn(), saveWithQueryRunner: jest.fn() };
    logger = { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const qr = { connect: jest.fn(), startTransaction: jest.fn(), commitTransaction: jest.fn(), rollbackTransaction: jest.fn(), release: jest.fn() };
    dataSource = { createQueryRunner: jest.fn().mockReturnValue(qr) };
    job = new ExpireShoppingCartsJob(cartRepository as any, productRepository as any, logger as any, dataSource as any);
  });

  it('does nothing when no expired carts', async () => {
    cartRepository.find.mockResolvedValue([]);
    await job.expireShoppingCarts();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('processes expired carts and releases reservations', async () => {
    const cartEntity = { id: 'c1', items: [{ productId: 'p1', quantity: 2 }], status: ShoppingCartStatus.ACTIVE, expiresAt: new Date(Date.now() - 1000) };
    cartRepository.find.mockResolvedValue([cartEntity]);
    productRepository.findByIdWithLock.mockResolvedValue({ id: 'p1', releaseReservation: jest.fn(), organizationId: 'o' });
    await job.expireShoppingCarts();
    expect(cartRepository.save).toHaveBeenCalled();
  });
});
