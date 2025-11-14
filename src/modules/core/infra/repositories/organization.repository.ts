import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization as OrganizationEntity } from "../entities/organization.entity";
import { Organization } from "../../domain/organization";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { RepositoryException } from "src/exceptions/repository.exception";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger as WinstonLogger } from "winston";

@Injectable()
export class OrganizationRepositoryImpl implements OrganizationRepository {
    constructor(
        @InjectRepository(OrganizationEntity)
        private readonly organizationRepository: Repository<OrganizationEntity>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    ) {}

    async find(): Promise<Organization[] | null> {
        try {
            this.logger.info('Fetching all organizations');

            const entities = await this.organizationRepository.find();
            if (entities.length === 0) {
                this.logger.warn('No organizations found in database');
                return null;
            }

            const domains = entities.map((entity) =>
                Organization.load({
                    name: entity.name,
                    description: entity.description,
                    isActive: entity.isActive,
                    createdAt: entity.createdAt,
                    updatedAt: entity.updatedAt,
                }, entity.id)
            );

            this.logger.info('Organizations fetched successfully', { count: domains.length });
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
            this.logger.info('Fetching organization by ID', { organizationId: id });

            const entity = await this.organizationRepository.findOne({ where: { id } });
            if (!entity) {
                this.logger.warn('Organization not found', { organizationId: id });
                return null;
            }

            const domain = Organization.load({
                name: entity.name,
                description: entity.description,
                isActive: entity.isActive,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            }, entity.id);

            this.logger.info('Organization fetched by ID successfully', { organizationId: id });
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
            this.logger.info('Fetching organization by name', { name });

            const entity = await this.organizationRepository.findOne({ where: { name } });
            if (!entity) {
                this.logger.warn('Organization not found', { name });
                return null;
            }

            const domain = Organization.load({
                name: entity.name,
                description: entity.description,
                isActive: entity.isActive,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            }, entity.id);

            this.logger.info('Organization fetched by name successfully', { name });
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
