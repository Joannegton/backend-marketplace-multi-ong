import { Type } from "class-transformer";
import { IsUUID, IsNumber, Min } from "class-validator";

export class AddItemToCartDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}