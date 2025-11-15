import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateShoppingCarts1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shopping_carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'items',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'confirmed', 'expired'],
            default: "'active'",
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shopping_carts');
  }
}
