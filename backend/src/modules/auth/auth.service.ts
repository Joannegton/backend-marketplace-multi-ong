import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { UserEntity } from '../core/infra/entities/user.entity';
import { Organization } from '../core/infra/entities/organization.entity';
import { ProductEntity } from '../core/infra/entities/product.entity';
import { OrderEntity } from '../core/infra/entities/order.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login(props: LoginDto): Promise<{
        token: string;
        user: { id: string; email: string; organizationId: string };
    }> {
        const user = await this.userRepository.findOne({
            where: { email: props.email },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            props.password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User is inactive');
        }

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                organizationId: user.organizationId,
            },
        };
    }

    private generateToken(user: UserEntity): string {
        const payload = {
            userId: user.id,
            email: user.email,
            organizationId: user.organizationId,
        };
        return this.jwtService.sign(payload);
    }

    async getUserProfile(userId: string, organizationId: string) {
        const organization = await this.organizationRepository.findOne({
            where: { id: organizationId },
            relations: ['users'],
        });

        if (!organization) {
            throw new UnauthorizedException('Organization not found');
        }

        const user = organization.users.find((u) => u.id === userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const totalProducts = await this.productRepository.count({
            where: { organizationId },
        });
        const activeProducts = await this.productRepository.count({
            where: { organizationId, isActive: true },
        });

        const LOW_STOCK_THRESHOLD = Number(
            this.configService.get<number>('LOW_STOCK_THRESHOLD', 5),
        );
        const lowStockCount = await this.productRepository
            .createQueryBuilder('p')
            .where('p.organizationId = :orgId', { orgId: organizationId })
            .andWhere('p.stock <= :threshold', {
                threshold: LOW_STOCK_THRESHOLD,
            })
            .getCount();

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newOrdersCount = await this.orderRepository
            .createQueryBuilder('o')
            .where(':orgId = ANY(o.organizationIds)', { orgId: organizationId })
            .andWhere('o.createdAt >= :since', {
                since: sevenDaysAgo.toISOString(),
            })
            .getCount();

        const recentOrdersRaw = await this.orderRepository
            .createQueryBuilder('o')
            .where(':orgId = ANY(o.organizationIds)', { orgId: organizationId })
            .orderBy('o.createdAt', 'DESC')
            .limit(5)
            .getMany();

        const recentOrders = recentOrdersRaw.map((o) => ({
            id: `ORD-${o.orderNumber}`,
            customer: o.cliente?.name ?? '—',
            total: Number(o.total),
            status: o.status,
        }));

        const lowStockProducts = await this.productRepository
            .createQueryBuilder('p')
            .where('p.organizationId = :orgId', { orgId: organizationId })
            .andWhere('p.stock <= :threshold', {
                threshold: LOW_STOCK_THRESHOLD,
            })
            .orderBy('p.stock', 'ASC')
            .limit(5)
            .getMany();

        const lowStockProductsList = lowStockProducts.map((p) => ({
            name: p.name,
            stock: p.stock,
        }));

        return {
            message: 'User profile retrieved successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
            organization: {
                id: organization.id,
                name: organization.name,
                description: organization.description,
                isActive: organization.isActive,
            },
            dashboard: {
                stats: {
                    totalProducts,
                    activeProducts,
                    newOrders: newOrdersCount,
                    lowStock: lowStockCount,
                },
                recentOrders,
                lowStockProducts: lowStockProductsList,
            },
        };
    }
}
