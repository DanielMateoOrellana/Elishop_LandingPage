import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';

import { Public } from '../auth/decorators';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all products with pagination' })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'featured', required: false, type: Boolean })
    @ApiQuery({ name: 'active', required: false, type: Boolean })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('categoryId') categoryId?: string,
        @Query('featured') featured?: string,
        @Query('active') active?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.productsService.findAll({
            categoryId,
            featured: featured ? featured === 'true' : undefined,
            active: active ? active === 'true' : undefined,
            search,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Get products with low stock' })
    @ApiQuery({ name: 'threshold', required: false, type: Number })
    getLowStock(@Query('threshold') threshold?: string) {
        return this.productsService.getLowStockProducts(
            threshold ? parseInt(threshold, 10) : undefined,
        );
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get product by slug' })
    findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product' })
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }

    @Post(':id/images')
    @ApiOperation({ summary: 'Add image to product' })
    addImage(
        @Param('id') id: string,
        @Body() body: { url: string; alt?: string },
    ) {
        return this.productsService.addImage(id, body.url, body.alt);
    }

    @Delete('images/:imageId')
    @ApiOperation({ summary: 'Delete product image' })
    removeImage(@Param('imageId') imageId: string) {
        return this.productsService.removeImage(imageId);
    }
}
