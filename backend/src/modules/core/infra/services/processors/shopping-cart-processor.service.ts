import { Process, Processor } from '@nestjs/bull';
import bull from 'bull';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ShoppingCartEntity } from '../../entities/shopping-cart.entity';

@Processor('carts')
@Injectable()
export class ShoppingCartProcessor {
    constructor(
        @InjectRepository(ShoppingCartEntity)
        private cartRepository: Repository<ShoppingCartEntity>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    @Process('persist-shopping-cart')
    async handlePersistShoppingCart(job: bull.Job) {
        const { cart } = job.data;

        try {
            this.logger.info('Persisting shopping cart to DB', {
                cartId: cart.id,
                category: 'business',
            });

            const entity = this.toEntity(cart);
            await this.cartRepository.save(entity);

            this.logger.info('Shopping cart persisted successfully', {
                cartId: cart.id,
                category: 'business',
            });
        } catch (error) {
            this.logger.error('Failed to persist shopping cart', {
                cartId: cart.id,
                error: error.message,
                category: 'business',
            });
            throw error;
        }
    }

    @Process('delete-shopping-cart')
    async handleDeleteShoppingCart(job: bull.Job) {
        const { cartId } = job.data;

        try {
            this.logger.info('Deleting shopping cart from DB', { cartId });

            await this.cartRepository.delete(cartId);

            this.logger.info('Shopping cart deleted successfully', { cartId });
        } catch (error) {
            this.logger.error('Failed to delete shopping cart', {
                cartId,
                error: error.message,
            });
            throw error;
        }
    }

    private toEntity(cart: any): ShoppingCartEntity {
        const entity = new ShoppingCartEntity();
        entity.id = cart.id;
        entity.items = cart.items;
        entity.status = cart.status;
        entity.expiresAt = new Date(cart.expiresAt);
        entity.createdAt = new Date(cart.createdAt);
        entity.updatedAt = new Date(cart.updatedAt);
        return entity;
    }
}