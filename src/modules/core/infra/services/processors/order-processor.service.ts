import { Process, Processor } from '@nestjs/bull';
import bull from 'bull';
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import Redis from 'ioredis';
import { OrderEntity, OrderStatus } from '../../entities/order.entity';

@Processor('orders')
@Injectable()
export class OrdersProcessor implements OnModuleInit {
    private redis: Redis;

    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private configService: ConfigService,
    ) {}

    onModuleInit() {
        const redisUrl =
            this.configService.get('REDIS_URL') || 'redis://localhost:6379';
        this.redis = new Redis(redisUrl);
    }

    @Process('process-payment')
    async handleProcessPayment(job: bull.Job) {
        const { orderId, userId, total } = job.data;
        const taskId = `payment:${orderId}`;

        const processed = await this.redis.get(taskId);
        if (processed) {
            this.logger.info('Payment already processed', { orderId, taskId });
            return;
        }

        this.logger.info('Processing payment', {
            orderId,
            userId,
            total,
            attempt: job.attemptsMade,
        });

        try {
            await this.simulatePaymentProcess(orderId, total);

            await this.orderRepository.update(
                { id: orderId },
                { status: OrderStatus.PROCESSING },
            );

            await this.redis.set(taskId, '1', 'EX', 86400); // 24 horas

            await job.queue.add(
                'send-notification',
                { orderId, userId, type: 'payment_confirmed' },
                { delay: 1000 },
            );

            this.logger.info('Payment processed successfully', { orderId });
        } catch (error) {
            this.logger.error('Payment processing failed', {
                orderId,
                error: error.message,
                attempt: job.attemptsMade,
            });
            throw error;
        }
    }

    @Process('send-notification')
    async handleSendNotification(job: bull.Job) {
        const { orderId, userId, type } = job.data;
        const taskId = `notification:${orderId}:${type}`;

        const processed = await this.redis.get(taskId);
        if (processed) {
            this.logger.info('Notification already sent', { orderId, taskId });
            return;
        }

        this.logger.info('Sending notification', { orderId, userId, type });

        try {
            await this.simulateNotificationSend(userId, orderId, type);

            await this.redis.set(taskId, '1', 'EX', 86400);

            this.logger.info('Notification sent successfully', {
                orderId,
                type,
            });
        } catch (error) {
            this.logger.error('Notification failed', {
                orderId,
                type,
                error: error.message,
            });
            throw error;
        }
    }

    private async simulatePaymentProcess(
        orderId: string,
        total: number,
    ): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.logger.info('Payment gateway called', { orderId, total });
                resolve();
            }, 1000);
        });
    }

    private async simulateNotificationSend(
        userId: string,
        orderId: string,
        type: string,
    ): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.logger.info('Notification sent', {
                    userId,
                    orderId,
                    type,
                });
                resolve();
            }, 500);
        });
    }
}
