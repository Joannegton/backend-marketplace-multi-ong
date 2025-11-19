import { NotFoundException } from '@nestjs/common';
import { RemoveCartItemUseCase } from './remove-cart-item.usecase';
import { ShoppingCart } from 'src/modules/core/domain/shopping-cart';

const makeQueryRunner = () => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('RemoveCartItemUseCase', () => {
  let usecase: RemoveCartItemUseCase;
  let cartRepository: any;
  let productRepository: any;
  let reservationService: any;
  let dataSource: any;
  let logger: any;

  beforeEach(() => {
    cartRepository = {
      findById: jest.fn(),
      saveWithQueryRunner: jest.fn(),
    };
    productRepository = {
      findByIdWithLock: jest.fn(),
      saveWithQueryRunner: jest.fn(),
    };
    reservationService = { releaseReservation: jest.fn() };
    const qr = makeQueryRunner();
    dataSource = { createQueryRunner: jest.fn().mockReturnValue(qr) };
    logger = { error: jest.fn(), warn: jest.fn() };

    usecase = new RemoveCartItemUseCase(
      cartRepository,
      productRepository,
      reservationService,
      dataSource as any,
      logger as any,
    );
  });

  it('throws NotFoundException when cart not found', async () => {
    cartRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute({ cartId: 'c', productId: 'p' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when item not in cart', async () => {
    const cart = ShoppingCart.create(20);
    cartRepository.findById.mockResolvedValue(cart);
    await expect(usecase.execute({ cartId: 'c', productId: 'p' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes item and releases reservation successfully', async () => {
      const product: any = { id: 'prod-r1', name: 'Produto', organizationId: 'org-1', price: 10, isActive: true, canReserveStock: () => true, reserveStock: jest.fn(), releaseReservation: jest.fn(), getAvailableStock: () => 10, toDto: () => ({ id: 'prod-r1' }) };
      const cart = ShoppingCart.create(20);
      cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 2, priceSnapshot: product.price, subtotal: 20 }];

    productRepository.findByIdWithLock.mockResolvedValue(product);
    cartRepository.findById.mockResolvedValue(cart);
    cartRepository.saveWithQueryRunner.mockResolvedValue(cart);
    reservationService.releaseReservation.mockResolvedValue(undefined);

    const dto = await usecase.execute({ cartId: cart.id, productId: product.id });

    expect(dto.id).toBe(cart.id);
    expect(reservationService.releaseReservation).toHaveBeenCalledWith(product.id, cart.id);
  });

  it('logs error when releaseReservation fails but still returns dto', async () => {
    const product: any = { id: 'prod-r2', name: 'Produto', organizationId: 'org-1', price: 5, isActive: true, canReserveStock: () => true, reserveStock: jest.fn(), releaseReservation: jest.fn(), getAvailableStock: () => 5, toDto: () => ({ id: 'prod-r2' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 1, priceSnapshot: product.price, subtotal: 5 }];

    productRepository.findByIdWithLock.mockResolvedValue(product);
    cartRepository.findById.mockResolvedValue(cart);
    cartRepository.saveWithQueryRunner.mockResolvedValue(cart);
    reservationService.releaseReservation.mockRejectedValue(new Error('redis fail'));

    const dto = await usecase.execute({ cartId: cart.id, productId: product.id });

    expect(dto.id).toBe(cart.id);
    expect(logger.error).toHaveBeenCalled();
  });
});
