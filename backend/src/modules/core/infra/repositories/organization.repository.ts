import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization as OrganizationEntity } from "../entities/organization.entity";
import { Organization } from "../../domain/organization";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { RepositoryException } from "src/exceptions/repository.exception";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger as WinstonLogger } from "winston";
import { OrganizationMapper } from "../mappers/organization.mapper";

@Injectable()
export class OrganizationRepositoryImpl implements OrganizationRepository {
    constructor(
        @InjectRepository(OrganizationEntity)
        private readonly organizationRepository: Repository<OrganizationEntity>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    ) {}

    async find(): Promise<Organization[] | null> {
        try {
            const entities = await this.organizationRepository.find();
            if (entities.length === 0) {
                this.logger.warn('No organizations found in database');
                return null;
            }

            const domains = entities.map((entity) => OrganizationMapper.toDomain(entity)
            );

            return domains;
        } catch (error) {
            this.logger.error('Error fetching organizations', {
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to fetch organizations: ${error.message}`);
        }
    }

    async findById(id: string): Promise<Organization | null> {
        try {
            const entity = await this.organizationRepository.findOne({ where: { id } });
            if (!entity) {
                this.logger.warn('Organization not found', { organizationId: id });
                return null;
            }

            const domain = OrganizationMapper.toDomain(entity);

            return domain;
        } catch (error) {
            this.logger.error('Error fetching organization by ID', {
                organizationId: id,
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to fetch organization by ID: ${error.message}`);
        }
    }

    async findByName(name: string): Promise<Organization | null> {
        try {
            const entity = await this.organizationRepository.findOne({ where: { name } });
            if (!entity) {
                this.logger.warn('Organization not found', { name });
                return null;
            }

            const domain = OrganizationMapper.toDomain(entity);

            return domain;
        } catch (error) {
            this.logger.error('Error fetching organization by name', {
                name,
                error: error.message,
                stack: error.stack,
            });
            throw new RepositoryException(`Failed to fetch organization by name: ${error.message}`);
        }
    }
}
