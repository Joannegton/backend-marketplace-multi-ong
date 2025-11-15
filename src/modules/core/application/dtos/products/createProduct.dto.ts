import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

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
}