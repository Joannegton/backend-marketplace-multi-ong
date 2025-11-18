import { Type } from 'class-transformer';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class UpdateCartItemQuantityDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}
