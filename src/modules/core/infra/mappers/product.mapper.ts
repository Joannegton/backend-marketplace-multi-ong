import { Product } from '../../domain/product';
import { ProductEntity } from '../entities/product.entity';

export class ProductMapper {
  static toEntity(domain: Product): Partial<ProductEntity> {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      price: domain.price,
      weight: domain.weight,
      stock: domain.stock,
      imageUrl: domain.imageUrl,
      organizationId: domain.organizationId,
      isActive: domain.isActive,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  static toDomain(entity: ProductEntity): Product {
    return Product.load(
      {
        name: entity.name,
        description: entity.description,
        price: Number(entity.price),
        weight: Number(entity.weight),
        stock: entity.stock,
        imageUrl: entity.imageUrl,
        organizationId: entity.organizationId,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
      entity.id,
    );
  }
}
