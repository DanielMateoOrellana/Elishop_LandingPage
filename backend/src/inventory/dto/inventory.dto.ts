import { IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';

export enum MovementType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    ADJUSTMENT = 'ADJUSTMENT',
    RETURN = 'RETURN',
    DAMAGE = 'DAMAGE',
    TRANSFER = 'TRANSFER',
}

export class UpdateStockDto {
    @IsNumber()
    quantity: number; // Positive = add, Negative = subtract

    @IsEnum(MovementType)
    @IsOptional()
    type?: MovementType;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    location?: 'Zaruma' | 'Sangolqui';
}

export class SetStockDto {
    @IsNumber()
    @Min(0)
    stock: number;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    location?: 'Zaruma' | 'Sangolqui';
}

export class UpdateInventorySettingsDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    minStock?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxStock?: number;

    @IsOptional()
    @IsString()
    location?: string;
}
