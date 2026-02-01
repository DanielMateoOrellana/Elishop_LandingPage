import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto) {
        const { images, initialStock, minStock, ...productData } = createProductDto;

        return this.prisma.product.create({
            data: {
                ...productData,
                price: new Prisma.Decimal(productData.price),
                compareAtPrice: productData.compareAtPrice
                    ? new Prisma.Decimal(productData.compareAtPrice)
                    : null,
                images: images
                    ? {
                        create: images.map((img, index) => ({
                            url: img.url,
                            alt: img.alt,
                            sortOrder: img.sortOrder ?? index,
                        })),
                    }
                    : undefined,
                inventory: {
                    create: {
                        stock: initialStock ?? 0,
                        minStock: minStock ?? 5,
                    },
                },
            },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                inventory: true,
            },
        });
    }

    async findAll(options?: {
        categoryId?: string;
        featured?: boolean;
        active?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const {
            categoryId,
            featured,
            active = true,
            search,
            page = 1,
            limit = 20,
        } = options ?? {};

        const where: Prisma.ProductWhereInput = {
            ...(active !== undefined && { isActive: active }),
            ...(categoryId && { categoryId }),
            ...(featured !== undefined && { isFeatured: featured }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    // sku removed
                ],
            }),
        };

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    inventory: true,
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                inventory: {
                    include: {
                        movements: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                        },
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                inventory: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product "${slug}" not found`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        await this.findOne(id);

        const { images, ...productData } = updateProductDto;

        return this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                price: productData.price
                    ? new Prisma.Decimal(productData.price)
                    : undefined,
                compareAtPrice: productData.compareAtPrice
                    ? new Prisma.Decimal(productData.compareAtPrice)
                    : undefined,
            },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                inventory: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.product.delete({
            where: { id },
        });
    }

    async addImage(productId: string, url: string, alt?: string) {
        const product = await this.findOne(productId);
        const maxOrder = product.images.length;

        return this.prisma.productImage.create({
            data: {
                productId,
                url,
                alt,
                sortOrder: maxOrder,
            },
        });
    }

    async removeImage(imageId: string) {
        return this.prisma.productImage.delete({
            where: { id: imageId },
        });
    }

    async getLowStockProducts(threshold?: number) {
        // Get all products with inventory, then filter
        const products = await this.prisma.product.findMany({
            where: {
                isActive: true,
            },
            include: {
                category: true,
                inventory: true,
            },
        });

        // Filter products where stock <= threshold (or minStock if no threshold)
        return products.filter((p) => {
            if (!p.inventory) return false;
            const limit = threshold ?? p.inventory.minStock;
            return p.inventory.stock <= limit;
        });
    }
}
