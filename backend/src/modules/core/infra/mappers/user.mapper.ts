import { User } from "../../domain/user";
import { UserEntity } from "../entities/user.entity";
import { OrganizationMapper } from "src/modules/core/infra/mappers/organization.mapper";

export class UserMapper {
    static toDomain(entity: UserEntity): User {
        return User.load({
            email: entity.email,
            name: entity.name,
            password: entity.password,
            organizationId: entity.organizationId,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        }, entity.id);
    }

    static toDomainList(raw: UserEntity[]): User[] {
        return raw.map(entity => this.toDomain(entity));
    }

    static toEntity(domain: User): UserEntity {
        const entity = UserEntity.create({
            email: domain.email,
            name: domain.name,
            password: domain.password,
            organizationId: domain.organizationId,
            isActive: domain.isActive,
        })
      
        return entity;
    }
}
