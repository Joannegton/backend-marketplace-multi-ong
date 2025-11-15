import { Order } from "../order";
import { QueryRunner } from "typeorm";

export interface OrderRepository {
    save(order: Order): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByOrganizationId(organizationId: string): Promise<Order[]>;
    findAllByOrganizationId(organizationId: string): Promise<Order[]>;
    findByIdAndOrganizationId(id: string, organizationId: string): Promise<Order | null>;
    saveWithQueryRunner(order: Order, queryRunner: QueryRunner): Promise<Order>;
}