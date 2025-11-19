import { ShoppingCartProcessor } from './shopping-cart-processor.service';

describe('ShoppingCartProcessor', () => {
  let processor: ShoppingCartProcessor;
  let cartRepository: any;
  let logger: any;

  beforeEach(() => {
    cartRepository = { save: jest.fn(), delete: jest.fn() };
    logger = { info: jest.fn(), error: jest.fn() };
    processor = new ShoppingCartProcessor(cartRepository as any, logger as any);
  });

  it('persists shopping cart successfully', async () => {
    const job: any = { data: { cart: { id: 'c', items: [], status: 'active', expiresAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() } } };
    await processor.handlePersistShoppingCart(job as any);
    expect(cartRepository.save).toHaveBeenCalled();
  });

  it('deletes shopping cart successfully', async () => {
    const job: any = { data: { cartId: 'c' } };
    await processor.handleDeleteShoppingCart(job as any);
    expect(cartRepository.delete).toHaveBeenCalledWith('c');
  });
});
