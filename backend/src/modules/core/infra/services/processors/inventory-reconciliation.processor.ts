import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';
import { DataSource } from 'typeorm';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';
import type { ProductRepository } from '../../../domain/repositories/product.repository';

type ReconcilePayload = {
    productId: string;
    cartId: string;
    quantity: number;
    reason?: string;
};

@Processor('orders')
@Injectable()
export class InventoryReconciliationProcessor {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly dataSource: DataSource,
    ) {}

    @Process('reconcile-inventory')
    async handleReconcile(job: Job<ReconcilePayload>) {
        const { productId, cartId, quantity, reason } = job.data;
        this.logger.info('Processing inventory reconciliation job', {
            productId,
            cartId,
            quantity,
            reason,
        });

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const product = await this.productRepository.findByIdWithLock(
                productId,
                queryRunner,
            );

            if (!product) {
                this.logger.warn('Product not found during reconciliation', {
                    productId,
                    cartId,
                });
                await queryRunner.rollbackTransaction();
                return;
            }

            try {
                product.releaseReservation(quantity);
                await this.productRepository.saveWithQueryRunner(
                    product,
                    queryRunner,
                );
                await queryRunner.commitTransaction();

                this.logger.info('Reconciliation applied: reservedStock released', {
                    productId,
                    cartId,
                    quantity,
                });
            } catch (err) {
                await queryRunner.rollbackTransaction();
                this.logger.error('Failed to apply reconciliation (transaction)', {
                    productId,
                    cartId,
                    error: err?.message,
                    stack: err?.stack,
                });
                throw err;
            }
        } finally {
            await queryRunner.release();
        }
    }
}
