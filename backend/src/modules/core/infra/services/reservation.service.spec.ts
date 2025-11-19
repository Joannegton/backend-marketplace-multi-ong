import { ReservationService } from './reservation.service';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('ReservationService', () => {
  let service: ReservationService;
  let queue: any;
  let configService: any;
  let logger: any;

  beforeEach(() => {
    const pipeline = { setex: jest.fn().mockReturnThis(), sadd: jest.fn().mockReturnThis(), expire: jest.fn().mockReturnThis(), del: jest.fn().mockReturnThis(), srem: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) };
    const client = { pipeline: jest.fn().mockReturnValue(pipeline), get: jest.fn(), smembers: jest.fn() };
    queue = { client };
    configService = { get: jest.fn().mockReturnValue(1) };
    logger = { error: jest.fn() };
    service = new ReservationService(queue as any, configService as any, logger as any);
  });

  it('reserves stock successfully', async () => {
    await expect(service.reserveStock('p', 'c', 2)).resolves.toBeUndefined();
    expect(queue.client.pipeline).toHaveBeenCalled();
  });

  it('throws when pipeline fails', async () => {
    queue.client.pipeline().exec.mockRejectedValue(new Error('fail'));
    await expect(service.reserveStock('p', 'c', 1)).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('gets reservation when present', async () => {
    const obj = { productId: 'p', cartId: 'c', quantity: 2, reservedAt: Date.now() };
    queue.client.get.mockResolvedValue(JSON.stringify(obj));
    const res = await service.getReservation('p', 'c');
    expect(res).toEqual(obj);
  });

  it('releases reservation successfully', async () => {
    await expect(service.releaseReservation('p', 'c')).resolves.toBeUndefined();
    expect(queue.client.pipeline).toHaveBeenCalled();
  });

  it('gets product reservations', async () => {
    queue.client.smembers.mockResolvedValue(['c1', 'c2']);
    const res = await service.getProductReservations('p');
    expect(res).toEqual(['c1', 'c2']);
  });

  it('clears cart reservations', async () => {
    queue.client.pipeline().exec.mockResolvedValue([]);
    await expect(service.clearCartReservations('c', ['p1', 'p2'])).resolves.toBeUndefined();
  });

  it('verifyReservation returns true only when quantities match', async () => {
    const obj = { productId: 'p', cartId: 'c', quantity: 3, reservedAt: Date.now() };
    queue.client.get.mockResolvedValue(JSON.stringify(obj));
    const resTrue = await service.verifyReservation('p', 'c', 3);
    expect(resTrue).toBe(true);
    const resFalse = await service.verifyReservation('p', 'c', 2);
    expect(resFalse).toBe(false);
  });
});
