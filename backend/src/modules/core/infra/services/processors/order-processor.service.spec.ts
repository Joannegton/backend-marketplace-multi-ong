import { OrdersProcessor } from './order-processor.service';

describe('OrdersProcessor', () => {
  let processor: OrdersProcessor;
  let orderRepository: any;
  let logger: any;
  let configService: any;

  beforeEach(() => {
    orderRepository = { update: jest.fn() };
    logger = { info: jest.fn(), error: jest.fn() };
    configService = { get: jest.fn().mockReturnValue('redis://') };
    processor = new OrdersProcessor(orderRepository as any, logger as any, configService as any);
  });

  it('skips processing if already processed', async () => {
    processor['redis'] = { get: jest.fn().mockResolvedValue('1') } as any;
    const job: any = { data: { orderId: 'o', userId: 'u', total: 10 }, attemptsMade: 0, queue: { add: jest.fn() } };
    await processor.handleProcessPayment(job);
    expect(logger.info).toHaveBeenCalled();
  });

  it('processes payment and enqueues next job', async () => {
    processor['redis'] = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue('OK') } as any;
    (processor as any).simulatePaymentProcess = jest.fn().mockResolvedValue(undefined);
    const job: any = { data: { orderId: 'o', userId: 'u', total: 10 }, attemptsMade: 0, queue: { add: jest.fn() } };
    await processor.handleProcessPayment(job);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(job.queue.add).toHaveBeenCalled();
  });

  it('sends notification when not already sent', async () => {
    processor['redis'] = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue('OK') } as any;
    (processor as any).simulateNotificationSend = jest.fn().mockResolvedValue(undefined);
    const job: any = { data: { orderId: 'o', userId: 'u', type: 't' } };
    await processor.handleSendNotification(job as any);
    expect(processor['redis'].set).toHaveBeenCalled();
  });
});
