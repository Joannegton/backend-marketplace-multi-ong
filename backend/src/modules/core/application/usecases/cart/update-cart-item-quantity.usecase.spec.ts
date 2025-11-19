import { NotFoundException } from '@nestjs/common';
import { UpdateCartItemQuantityUseCase } from './update-cart-item-quantity.usecase';
import { ShoppingCart } from 'src/modules/core/domain/shopping-cart';

const makeQueryRunner = () => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('UpdateCartItemQuantityUseCase', () => {
  let usecase: UpdateCartItemQuantityUseCase;
  let cartRepository: any;
  let productRepository: any;
  let reservationService: any;
  let dataSource: any;
  let logger: any;

  beforeEach(() => {
    cartRepository = { findById: jest.fn(), saveWithQueryRunner: jest.fn() };
    productRepository = { findByIdWithLock: jest.fn(), saveWithQueryRunner: jest.fn() };
    reservationService = { reserveStock: jest.fn() };
    const qr1 = makeQueryRunner();
    const qr2 = makeQueryRunner();
    dataSource = { createQueryRunner: jest.fn().mockReturnValueOnce(qr1).mockReturnValueOnce(qr2) };
    logger = { error: jest.fn() };

    usecase = new UpdateCartItemQuantityUseCase(
      cartRepository,
      productRepository,
      reservationService,
      dataSource as any,
      logger as any,
    );
  });

  it('throws NotFoundException when cart not found', async () => {
    cartRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute({ cartId: 'c', productId: 'p', quantity: 1 })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when product not found', async () => {
    const product: any = { id: 'u1', name: 'p', organizationId: 'o', price: 1, toDto: () => ({ id: 'u1' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 1, priceSnapshot: product.price, subtotal: 1 }];
    cartRepository.findById.mockResolvedValue(cart);
    productRepository.findByIdWithLock.mockResolvedValue(null);
    await expect(usecase.execute({ cartId: cart.id, productId: 'x', quantity: 2 })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates quantity and reserves new total', async () => {
    const product: any = { id: 'u2', name: 'p', organizationId: 'o', price: 1, isActive: true, canReserveStock: () => true, reserveStock: jest.fn(), releaseReservation: jest.fn(), getAvailableStock: () => 10, toDto: () => ({ id: 'u2' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 1, priceSnapshot: product.price, subtotal: 1 }];

    productRepository.findByIdWithLock.mockResolvedValue(product);
    productRepository.saveWithQueryRunner.mockResolvedValue(product);
    cartRepository.findById.mockResolvedValue(cart);
    cartRepository.saveWithQueryRunner.mockResolvedValue(cart);
    reservationService.reserveStock.mockResolvedValue(undefined);

    const dto = await usecase.execute({ cartId: cart.id, productId: product.id, quantity: 3 });

    expect(dto.id).toBe(cart.id);
    expect(reservationService.reserveStock).toHaveBeenCalledWith(product.id, cart.id, 3);
  });

  it('reverts when reserveStock fails', async () => {
    const product: any = { id: 'u3', name: 'p', organizationId: 'o', price: 1, isActive: true, canReserveStock: () => true, reserveStock: jest.fn(), releaseReservation: jest.fn(), getAvailableStock: () => 10, toDto: () => ({ id: 'u3' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 1, priceSnapshot: product.price, subtotal: 1 }];

    productRepository.findByIdWithLock
      .mockResolvedValueOnce(product)
      .mockResolvedValueOnce(product);
    productRepository.saveWithQueryRunner.mockResolvedValue(product);
    cartRepository.findById.mockResolvedValue(cart);
    cartRepository.saveWithQueryRunner.mockResolvedValue(cart);
    reservationService.reserveStock.mockRejectedValue(new Error('redis fail'));

    await expect(usecase.execute({ cartId: cart.id, productId: product.id, quantity: 5 })).rejects.toThrow('Failed to reserve stock in cache; operation aborted');
  });
});
