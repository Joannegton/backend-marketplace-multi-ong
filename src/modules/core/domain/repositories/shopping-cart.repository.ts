import { ShoppingCart } from "../shopping-cart";
import { QueryRunner } from "typeorm";

export interface ShoppingCartRepository {
    save(cart: ShoppingCart): Promise<ShoppingCart>;
    findById(id: string): Promise<ShoppingCart | null>;
    delete(id: string): Promise<void>;
    deleteWithQueryRunner(id: string, queryRunner: QueryRunner): Promise<void>;
}
