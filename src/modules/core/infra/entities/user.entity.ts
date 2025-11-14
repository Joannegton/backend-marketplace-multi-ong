import { Organization } from 'src/modules/core/infra/entities/organization.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({ type: 'uuid' })
    organizationId: string;

    @ManyToOne(() => Organization, (organization) => organization.users)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    static create(props: Partial<UserEntity>): UserEntity {
        const user = new UserEntity();
        Object.assign(user, props);
        return user;
    }
}
