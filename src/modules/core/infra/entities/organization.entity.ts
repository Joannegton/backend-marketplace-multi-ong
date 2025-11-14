import { UserEntity } from 'src/modules/core/infra/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserEntity, (user) => user.organization)
  users: UserEntity[];

  @OneToMany(() => Product, (product) => product.organization)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static create(props: Partial<Organization>): Organization {
    const organization = new Organization();
    Object.assign(organization, props);
    return organization;
  }
}
