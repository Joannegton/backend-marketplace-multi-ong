import { Organization } from "../../domain/organization";
import { Organization as OrganizationEntity } from "../entities/organization.entity";

export class OrganizationMapper {
    static toDomain(raw: OrganizationEntity): Organization {
        return Organization.load({
            name: raw.name,
            description: raw.description,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, raw.id);
    }

    static toDomainList(raw: OrganizationEntity[]): Organization[] {
        return raw.map(entity => this.toDomain(entity));
    }

    static toEntity(domain: Organization): OrganizationEntity {
        const entity = OrganizationEntity.create({
            name: domain.name,
            description: domain.description,
            isActive: domain.isActive,
        });

        return entity;
    }
}
