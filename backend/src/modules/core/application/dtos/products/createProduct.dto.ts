import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    Min,
    IsIn,
} from 'class-validator';
import { PRODUCT_CATEGORIES } from 'src/modules/core/domain/product';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @Min(0)
    weight: number;

    @IsNumber()
    @Min(0)
    stock: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(PRODUCT_CATEGORIES)
    category: string;
}
