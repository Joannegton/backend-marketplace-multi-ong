
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchProductsDto {
    @IsString()
    @Transform(({ value }) => value?.trim())
    query: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => value ? Number(value) : undefined)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => value ? Number(value) : undefined)
    maxPrice?: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    category?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => value ? Number(value) : 10)
    limit?: number = 10;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => value ? Number(value) : 0)
    offset?: number = 0;
}
