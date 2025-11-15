import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

export type Reservation = {
    productId: string;
    cartId: string;
    quantity: number;
    reservedAt: number;
};

@Injectable()
export class ReservationService {
    private readonly cartTtlSeconds: number;

    constructor(
        @InjectQueue('orders') private readonly ordersQueue: Queue,
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        const cartTtlMinutes = this.configService.get<number>('CART_TTL_MINUTES', 20);
        this.cartTtlSeconds = cartTtlMinutes * 60;
    }

    async reserveStock(
        productId: string,
        cartId: string,
        quantity: number,
    ): Promise<void> {
        try {
            const redis = this.ordersQueue.client;
            const reservationKey = this.getReservationKey(productId, cartId);
            const productReservedKey = this.getProductReservedKey(productId);

            const reservation: Reservation = {
                productId,
                cartId,
                quantity,
                reservedAt: Date.now(),
            };

            await redis
                .pipeline()
                .setex(reservationKey, this.cartTtlSeconds, JSON.stringify(reservation))
                .sadd(productReservedKey, cartId)
                .expire(productReservedKey, this.cartTtlSeconds)
                .exec();
        } catch (error) {
            this.logger.error('Failed to reserve stock', {
                productId,
                cartId,
                quantity,
                error: error.message,
                category: 'business',
            });
            throw new InvalidPropsException(
                `Failed to reserve stock in Redis: ${error.message}`,
            );
        }
    }

    async getReservation(productId: string, cartId: string): Promise<Reservation | null> {
        try {
            const redis = this.ordersQueue.client;
            const reservationKey = this.getReservationKey(productId, cartId);
            const data = await redis.get(reservationKey);

            if (!data) {
                return null;
            }

            return JSON.parse(data) as Reservation;
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to get reservation from Redis: ${error.message}`,
            );
        }
    }

    async releaseReservation(productId: string, cartId: string): Promise<void> {
        try {
            const redis = this.ordersQueue.client;
            const reservationKey = this.getReservationKey(productId, cartId);
            const productReservedKey = this.getProductReservedKey(productId);

            await redis
                .pipeline()
                .del(reservationKey)
                .srem(productReservedKey, cartId)
                .exec();
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to release reservation from Redis: ${error.message}`,
            );
        }
    }

    async getProductReservations(productId: string): Promise<string[]> {
        try {
            const redis = this.ordersQueue.client;
            const productReservedKey = this.getProductReservedKey(productId);
            const cartIds = await redis.smembers(productReservedKey);

            return cartIds || [];
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to get product reservations from Redis: ${error.message}`,
            );
        }
    }

    async clearCartReservations(
        cartId: string,
        productIds: string[],
    ): Promise<void> {
        try {
            const redis = this.ordersQueue.client;
            const pipeline = redis.pipeline();

            for (const productId of productIds) {
                const reservationKey = this.getReservationKey(productId, cartId);
                const productReservedKey = this.getProductReservedKey(productId);

                pipeline
                    .del(reservationKey)
                    .srem(productReservedKey, cartId);
            }

            await pipeline.exec();
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to clear cart reservations from Redis: ${error.message}`,
            );
        }
    }

    async verifyReservation(
        productId: string,
        cartId: string,
        expectedQuantity: number,
    ): Promise<boolean> {
        try {
            const reservation = await this.getReservation(productId, cartId);

            if (!reservation) {
                return false;
            }

            return reservation.quantity === expectedQuantity;
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to verify reservation: ${error.message}`,
            );
        }
    }

    private getReservationKey(productId: string, cartId: string): string {
        return `product:reservation:${productId}:${cartId}`;
    }

    private getProductReservedKey(productId: string): string {
        return `product:reserved:${productId}`;
    }
}
