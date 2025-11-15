import { IsString, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    weight?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    stock?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}
