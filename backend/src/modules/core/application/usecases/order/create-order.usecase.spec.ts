import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderUseCase } from './create-order.usecase';
import { ShoppingCart } from 'src/modules/core/domain/shopping-cart';

const makeQueryRunner = () => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('CreateOrderUseCase', () => {
  let usecase: CreateOrderUseCase;
  let cartRepository: any;
  let orderRepository: any;
  let productRepository: any;
  let reservationService: any;
  let productCacheService: any;
  let logger: any;
  let dataSource: any;

  beforeEach(() => {
    cartRepository = { findById: jest.fn(), deleteWithQueryRunner: jest.fn() };
    orderRepository = { saveWithQueryRunner: jest.fn() };
    productRepository = { findByIdsWithLock: jest.fn(), saveWithQueryRunner: jest.fn() };
    reservationService = { verifyReservation: jest.fn(), clearCartReservations: jest.fn() };
    productCacheService = { invalidateOrgProducts: jest.fn() };
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const qr = makeQueryRunner();
    dataSource = { createQueryRunner: jest.fn().mockReturnValue(qr) };

    usecase = new CreateOrderUseCase(
      cartRepository,
      orderRepository,
      productRepository,
      reservationService,
      productCacheService,
      logger as any,
      dataSource as any,
    );
  });

  it('throws NotFoundException when cart not found', async () => {
    cartRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('c', {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when cart is empty', async () => {
    const cart = ShoppingCart.create(20);
    cartRepository.findById.mockResolvedValue(cart);
    await expect(usecase.execute(cart.id, {} as any)).rejects.toThrow();
  });

  it('throws when not all products are returned locked', async () => {
    const product: any = { id: 'p1', name: 'p', organizationId: 'o', price: 1, toDto: () => ({ id: 'p1' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 1, priceSnapshot: 1, subtotal: 1 }];

    cartRepository.findById.mockResolvedValue(cart);
    productRepository.findByIdsWithLock.mockResolvedValue([]);

    await expect(usecase.execute(cart.id, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when reservation verification fails', async () => {
    const product: any = { id: 'p2', name: 'p', organizationId: 'o', price: 1, toDto: () => ({ id: 'p2' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 2, priceSnapshot: 1, subtotal: 2 }];

    cartRepository.findById.mockResolvedValue(cart);
    productRepository.findByIdsWithLock.mockResolvedValue([product]);
    reservationService.verifyReservation.mockResolvedValue(false);

    await expect(usecase.execute(cart.id, { name: 'n', cpf: 'cpf', email: 'e', cep: 'c', address: 'a', number: '1' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates order successfully and clears reservations', async () => {
    const product: any = { id: 'p3', name: 'p', organizationId: 'o1', price: 10, isActive: true, canReserveStock: () => true, getAvailableStock: () => 10, confirmReservedStock: jest.fn(), reserveStock: jest.fn(), releaseReservation: jest.fn(), toDto: () => ({ id: 'p3' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 2, priceSnapshot: 10, subtotal: 20 }];

    cartRepository.findById.mockResolvedValue(cart);
    productRepository.findByIdsWithLock.mockResolvedValue([product]);
    reservationService.verifyReservation.mockResolvedValue(true);
    productRepository.saveWithQueryRunner.mockResolvedValue(product);

    const savedOrder = { id: 'ord1', organizationIds: ['o1'], total: 20, items: [{ toDto: () => ({}) }], toDto: () => ({ id: 'ord1' }) };
    orderRepository.saveWithQueryRunner.mockResolvedValue(savedOrder);

    reservationService.clearCartReservations.mockResolvedValue(undefined);

    const dto = await usecase.execute(cart.id, { name: 'n', cpf: 'cpf', email: 'e', cep: 'c', address: 'a', number: '1' } as any);

    expect(dto.id).toBe('ord1');
    expect(productRepository.saveWithQueryRunner).toHaveBeenCalled();
    expect(cartRepository.deleteWithQueryRunner).toHaveBeenCalled();
    expect(productCacheService.invalidateOrgProducts).toHaveBeenCalledWith('o1');
  });

  it('returns order even if clearing reservations fails', async () => {
    const product: any = { id: 'p4', name: 'p', organizationId: 'o1', price: 10, isActive: true, canReserveStock: () => true, getAvailableStock: () => 10, confirmReservedStock: jest.fn(), reserveStock: jest.fn(), releaseReservation: jest.fn(), toDto: () => ({ id: 'p4' }) };
    const cart = ShoppingCart.create(20);
    cart['props'].items = [{ productId: product.id, productName: product.name, quantity: 1, priceSnapshot: 10, subtotal: 10 }];

    cartRepository.findById.mockResolvedValue(cart);
    productRepository.findByIdsWithLock.mockResolvedValue([product]);
    reservationService.verifyReservation.mockResolvedValue(true);
    productRepository.saveWithQueryRunner.mockResolvedValue(product);

    const savedOrder = { id: 'ord2', organizationIds: ['o1'], total: 10, items: [{ toDto: () => ({}) }], toDto: () => ({ id: 'ord2' }) };
    orderRepository.saveWithQueryRunner.mockResolvedValue(savedOrder);

    reservationService.clearCartReservations.mockRejectedValue(new Error('redis fail'));

    const dto = await usecase.execute(cart.id, { name: 'n', cpf: 'cpf', email: 'e', cep: 'c', address: 'a', number: '1' } as any);
    expect(dto.id).toBe('ord2');
    expect(logger.error).toHaveBeenCalled();
  });
});
