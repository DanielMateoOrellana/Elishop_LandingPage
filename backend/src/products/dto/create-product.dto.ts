import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsArray,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductImageDto {
    @IsString()
    url: string;

    @IsOptional()
    @IsString()
    alt?: string;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;
}

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    compareAtPrice?: number;

    @IsString()
    categoryId: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageDto)
    images?: ProductImageDto[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsBoolean()
    isNew?: boolean;

    // Initial inventory
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    initialStock?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stockZaruma?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stockSangolqui?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    minStock?: number;
}
