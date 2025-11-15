import { Inject, Injectable } from "@nestjs/common";
import { OrderRepository } from "../../domain/repositories/order.repository";
import { Order } from "../../domain/order";
import { OrderMapper } from "../mappers/order.mapper";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "../entities/order.entity";
import { Repository, QueryRunner } from "typeorm";
import { RepositoryException } from "src/exceptions/repository.exception";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger as WinstonLogger } from "winston";

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    ) {}

    async save(order: Order): Promise<Order> {
        try {
            const entity = OrderMapper.toEntity(order);

            const savedEntity = await this.orderRepository.save(entity);

            return OrderMapper.toDomain(savedEntity);
        } catch (error) {
            this.logger.error('Error saving order', {
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to save order: ${error.message}`);
        }
    }

    async saveWithQueryRunner(order: Order, queryRunner: QueryRunner): Promise<Order> {
        try {
            const entity = OrderMapper.toEntity(order);
            await queryRunner.manager.save(OrderEntity, entity);
            return order;
        } catch (error) {
            this.logger.error('Error saving order with query runner', {
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to save order: ${error.message}`);
        }
    }

    async findById(id: string): Promise<Order | null> {
        try {
            const entity = await this.orderRepository.findOne({
                where: { id },
                relations: ['items'],
            });
            if (!entity) {
                return null;
            }
            return OrderMapper.toDomain(entity);
        } catch (error) {
            this.logger.error('Error finding order by id', {
                id,
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to find order by id: ${error.message}`);
        }
    }

    async findByOrganizationId(organizationId: string): Promise<Order[]> {
        try {
            const entities = await this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.items', 'items')
                .where(':organizationId = ANY(order.organizationIds)', { organizationId })
                .orderBy('order.createdAt', 'DESC')
                .getMany();

            return entities.map(entity => OrderMapper.toDomain(entity));
        } catch (error) {
            this.logger.error('Error finding orders by organization id', {
                organizationId,
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to find orders by organization id: ${error.message}`);
        }
    }

    async findAllByOrganizationId(organizationId: string): Promise<Order[]> {
        try {
            const entities = await this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.items', 'items')
                .where(':organizationId = ANY(order.organizationIds)', { organizationId })
                .orderBy('order.createdAt', 'DESC')
                .getMany();

            return entities.map(entity => OrderMapper.toDomain(entity));
        } catch (error) {
            this.logger.error('Error finding orders by organization id', {
                organizationId,
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to find orders by organization id: ${error.message}`);
        }
    }

    async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Order | null> {
        try {
            const entity = await this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.items', 'items')
                .where('order.id = :id', { id })
                .andWhere(':organizationId = ANY(order.organizationIds)', { organizationId })
                .getOne();

            if (!entity) {
                return null;
            }
            return OrderMapper.toDomain(entity);
        } catch (error) {
            this.logger.error('Error finding order by id and organization id', {
                id,
                organizationId,
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to find order by id and organization id: ${error.message}`);
        }
    }
}