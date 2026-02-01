import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    async findAll(includeInactive = false) {
        return this.prisma.category.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    where: { isActive: true },
                    take: 10,
                },
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async findBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isActive: true },
                    include: {
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                        inventory: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category "${slug}" not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        await this.findOne(id); // Verify exists

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Verify exists

        return this.prisma.category.delete({
            where: { id },
        });
    }
}
