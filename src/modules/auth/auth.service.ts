import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { UserEntity } from '../core/infra/entities/user.entity';
import { Organization } from '../core/infra/entities/organization.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        private readonly jwtService: JwtService,
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
        };
    }
}
