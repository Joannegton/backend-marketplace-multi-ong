import { NotFoundException } from '@nestjs/common';
import { AddItemToCartUseCase } from './add-item-to-cart.usecase';
import { ShoppingCart } from 'src/modules/core/domain/shopping-cart';

const makeQueryRunner = () => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('AddItemToCartUseCase', () => {
  let usecase: AddItemToCartUseCase;
  let cartRepository: any;
  let productRepository: any;
  let reservationService: any;
  let dataSource: any;
  let logger: any;
  let configService: any;

  beforeEach(() => {
    cartRepository = {
      findById: jest.fn(),
      saveWithQueryRunner: jest.fn(),
    };
    productRepository = {
      findByIdWithLock: jest.fn(),
      saveWithQueryRunner: jest.fn(),
    };
    reservationService = { reserveStock: jest.fn() };
    const qr1 = makeQueryRunner();
    const qr2 = makeQueryRunner();
    dataSource = {
      createQueryRunner: jest
        .fn()
        .mockReturnValueOnce(qr1)
        .mockReturnValueOnce(qr2),
    };
    logger = { error: jest.fn(), info: jest.fn() };
    configService = { get: jest.fn().mockReturnValue(20) };

    const ordersQueue: any = { add: jest.fn(), client: {} };

    usecase = new AddItemToCartUseCase(
      cartRepository,
      productRepository,
      reservationService,
      ordersQueue,
      dataSource as any,
      logger as any,
      configService as any,
    );
  });

  it('adds item to a new cart and reserves stock', async () => {
    const product: any = {
      id: 'p1',
      name: 'p',
      description: 'd',
      price: 10,
      weight: 1,
      stock: 10,
      imageUrl: undefined,
      category: 'c',
      organizationId: 'org',
      isActive: true,
      canReserveStock: () => true,
      reserveStock: jest.fn(),
      releaseReservation: jest.fn(),
      getAvailableStock: () => 10,
      toDto: () => ({ id: 'p1' }),
    };

    productRepository.findByIdWithLock.mockResolvedValue(product);
    cartRepository.findById.mockResolvedValue(null);

    const savedCart = ShoppingCart.create(20);
    savedCart['props'].items = [{ productId: product.id, productName: product.name, quantity: 2, priceSnapshot: product.price, subtotal: 20 }];
    cartRepository.saveWithQueryRunner.mockResolvedValue(savedCart);

    const dto = await usecase.execute({ productId: product.id, quantity: 2 });

    expect(dto.id).toBe(savedCart.id);
    expect(reservationService.reserveStock).toHaveBeenCalledWith(
      product.id,
      savedCart.id,
      2,
    );
  });

  it('throws NotFoundException when product not found', async () => {
    productRepository.findByIdWithLock.mockResolvedValue(null);

    await expect(
      usecase.execute({ productId: 'x', quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('reverts product reservation when Redis reserve fails', async () => {
    const product: any = {
      id: 'p2',
      name: 'p',
      description: 'd',
      price: 10,
      weight: 1,
      stock: 10,
      imageUrl: undefined,
      category: 'c',
      organizationId: 'org',
      isActive: true,
      canReserveStock: () => true,
      reserveStock: jest.fn(),
      releaseReservation: jest.fn(),
      getAvailableStock: () => 10,
      toDto: () => ({ id: 'p2' }),
    };

    productRepository.findByIdWithLock
      .mockResolvedValueOnce(product)
      .mockResolvedValueOnce(product);

    const savedCart = ShoppingCart.create(20);
    savedCart['props'].items = [
      { productId: product.id, productName: product.name, quantity: 3, priceSnapshot: product.price, subtotal: 30 },
    ];

    cartRepository.saveWithQueryRunner.mockResolvedValue(savedCart);
    productRepository.saveWithQueryRunner.mockResolvedValue(product);
    reservationService.reserveStock.mockRejectedValue(new Error('redis fail'));

    await expect(
      usecase.execute({ productId: product.id, quantity: 3 }),
    ).rejects.toThrow('Failed to reserve stock in cache; operation aborted');
  });
});
