import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateStockDto, SetStockDto, UpdateInventorySettingsDto, MovementType } from './dto';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async getInventoryByProductId(productId: string) {
        const inventory = await this.prisma.inventory.findUnique({
            where: { productId },
            include: {
                product: {
                    include: { category: true, images: { take: 1 } },
                },
                movements: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });

        if (!inventory) {
            throw new NotFoundException(`Inventory for product ${productId} not found`);
        }

        return inventory;
    }

    async getAllInventory(options?: {
        lowStockOnly?: boolean;
        categoryId?: string;
        search?: string;
    }) {
        const { lowStockOnly, categoryId, search } = options ?? {};

        const inventories = await this.prisma.inventory.findMany({
            where: {
                product: {
                    isActive: true,
                    ...(categoryId && { categoryId }),
                    ...(search && {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                        ],
                    }),
                },
            },
            include: {
                product: {
                    include: {
                        category: true,
                        images: { take: 1, orderBy: { sortOrder: 'asc' } },
                    },
                },
            },
            orderBy: { stock: 'asc' },
        });

        // Filter low stock if needed
        if (lowStockOnly) {
            return inventories.filter((inv) => inv.stock <= inv.minStock);
        }

        return inventories;
    }

    async updateStock(productId: string, updateStockDto: UpdateStockDto, userId?: string) {
        const inventory = await this.getInventoryByProductId(productId);
        const { quantity, location, reason, reference } = updateStockDto;

        let newStock = inventory.stock;
        let newZaruma = inventory.stockZaruma;
        let newSangolqui = inventory.stockSangolqui;

        // Logic for location-specific updates
        if (location === 'Zaruma') {
            newZaruma = (inventory.stockZaruma || 0) + quantity;
            if (newZaruma < 0) {
                throw new BadRequestException(
                    `No hay suficiente stock en Zaruma. Actual: ${inventory.stockZaruma}, Solicitado: ${Math.abs(quantity)}`,
                );
            }
        } else if (location === 'Sangolqui') {
            newSangolqui = (inventory.stockSangolqui || 0) + quantity;
            if (newSangolqui < 0) {
                throw new BadRequestException(
                    `No hay suficiente stock en Sangolquí. Actual: ${inventory.stockSangolqui}, Solicitado: ${Math.abs(quantity)}`,
                );
            }
        } else {
            // Fallback for general stock update (legacy or unspecified location)
            newStock = inventory.stock + quantity;
            if (newStock < 0) {
                throw new BadRequestException(
                    `Cannot reduce stock below 0. Current: ${inventory.stock}, Requested change: ${quantity}`,
                );
            }
        }

        // Recalculate total if location was specified
        if (location) {
            newStock = (newZaruma || 0) + (newSangolqui || 0);
        }

        // Determine movement type
        const type = updateStockDto.type ?? (quantity > 0 ? MovementType.PURCHASE : MovementType.SALE);

        // Update stock and create movement in transaction
        const [updatedInventory] = await this.prisma.$transaction([
            this.prisma.inventory.update({
                where: { productId },
                data: {
                    stock: newStock,
                    stockZaruma: newZaruma,
                    stockSangolqui: newSangolqui,
                    lastRestocked: quantity > 0 ? new Date() : undefined,
                    lastSold: quantity < 0 ? new Date() : undefined,
                },
                include: {
                    product: { select: { id: true, name: true } },
                },
            }),
            this.prisma.inventoryMovement.create({
                data: {
                    inventoryId: inventory.id,
                    type,
                    quantity,
                    reason: location ? `[${location}] ${reason || ''}` : reason,
                    reference,
                    userId,
                },
            }),
        ]);

        return {
            ...updatedInventory,
            previousStock: inventory.stock,
            change: quantity,
        };
    }

    async setStock(productId: string, setStockDto: SetStockDto, userId?: string) {
        const inventory = await this.getInventoryByProductId(productId);
        const difference = setStockDto.stock - inventory.stock;

        if (difference === 0) {
            return inventory;
        }

        // Update stock and create adjustment movement
        const [updatedInventory] = await this.prisma.$transaction([
            this.prisma.inventory.update({
                where: { productId },
                data: { stock: setStockDto.stock },
                include: {
                    product: { select: { id: true, name: true } },
                },
            }),
            this.prisma.inventoryMovement.create({
                data: {
                    inventoryId: inventory.id,
                    type: MovementType.ADJUSTMENT,
                    quantity: difference,
                    reason: setStockDto.reason ?? 'Manual stock adjustment',
                    userId,
                },
            }),
        ]);

        return {
            ...updatedInventory,
            previousStock: inventory.stock,
            newStock: setStockDto.stock,
            adjustment: difference,
        };
    }

    async updateSettings(productId: string, settingsDto: UpdateInventorySettingsDto) {
        await this.getInventoryByProductId(productId);

        return this.prisma.inventory.update({
            where: { productId },
            data: settingsDto,
            include: {
                product: { select: { id: true, name: true } },
            },
        });
    }

    async getMovementHistory(productId: string, options?: { limit?: number; offset?: number }) {
        const { limit = 50, offset = 0 } = options ?? {};
        const inventory = await this.getInventoryByProductId(productId);

        return this.prisma.inventoryMovement.findMany({
            where: { inventoryId: inventory.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async getLowStockAlerts() {
        const lowStock = await this.prisma.inventory.findMany({
            where: {
                product: { isActive: true },
            },
            include: {
                product: {
                    include: {
                        category: true,
                        images: { take: 1 },
                    },
                },
            },
        });

        // Filter where stock <= minStock
        return lowStock
            .filter((inv) => inv.stock <= inv.minStock)
            .map((inv) => ({
                ...inv,
                alertLevel: inv.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
                deficit: inv.minStock - inv.stock,
            }));
    }

    async getInventoryStats() {
        const [totalProducts, lowStockCount, outOfStockCount, totalValue] = await Promise.all([
            this.prisma.product.count({ where: { isActive: true } }),
            this.prisma.inventory.count({
                where: {
                    product: { isActive: true },
                    stock: { gt: 0 },
                },
            }),
            this.prisma.inventory.count({
                where: {
                    product: { isActive: true },
                    stock: 0,
                },
            }),
            this.prisma.$queryRaw<[{ total: number }]>`
        SELECT COALESCE(SUM(i.stock * p.price), 0) as total
        FROM "Inventory" i
        JOIN "Product" p ON i."productId" = p.id
        WHERE p."isActive" = true
      `,
        ]);

        // Get low stock (stock > 0 but <= minStock)
        const lowStockProducts = await this.prisma.inventory.count({
            where: {
                product: { isActive: true },
                stock: { gt: 0 },
            },
        });

        return {
            totalProducts,
            inStock: lowStockCount,
            outOfStock: outOfStockCount,
            lowStock: lowStockProducts,
            totalInventoryValue: totalValue[0]?.total ?? 0,
        };
    }
    async getAllMovements(options?: {
        type?: MovementType;
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { type, limit = 50, offset = 0, startDate, endDate } = options ?? {};

        const where: any = {};
        if (type) where.type = type;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const [movements, total] = await Promise.all([
            this.prisma.inventoryMovement.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    inventory: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    images: { take: 1 }
                                }
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                },
            }),
            this.prisma.inventoryMovement.count({ where }),
        ]);

        return {
            movements,
            total,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit),
        };
    }
}
