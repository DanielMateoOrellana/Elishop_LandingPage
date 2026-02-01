import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UpdateStockDto, SetStockDto, UpdateInventorySettingsDto } from './dto';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    @ApiOperation({ summary: 'Get all inventory' })
    @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'search', required: false })
    findAll(
        @Query('lowStockOnly') lowStockOnly?: string,
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
    ) {
        return this.inventoryService.getAllInventory({
            lowStockOnly: lowStockOnly === 'true',
            categoryId,
            search,
        });
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get inventory statistics' })
    getStats() {
        return this.inventoryService.getInventoryStats();
    }

    @Get('alerts')
    @ApiOperation({ summary: 'Get low stock alerts' })
    getAlerts() {
        return this.inventoryService.getLowStockAlerts();
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get inventory for a product' })
    findByProduct(@Param('productId') productId: string) {
        return this.inventoryService.getInventoryByProductId(productId);
    }

    @Get('product/:productId/movements')
    @ApiOperation({ summary: 'Get movement history for a product' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    getMovements(
        @Param('productId') productId: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.inventoryService.getMovementHistory(productId, {
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        });
    }

    @Post('product/:productId/update-stock')
    @ApiOperation({ summary: 'Add or subtract stock (creates movement record)' })
    updateStock(
        @Param('productId') productId: string,
        @Body() updateStockDto: UpdateStockDto,
    ) {
        // TODO: Get userId from JWT when auth is implemented
        return this.inventoryService.updateStock(productId, updateStockDto);
    }

    @Post('product/:productId/set-stock')
    @ApiOperation({ summary: 'Set absolute stock value (creates adjustment record)' })
    setStock(
        @Param('productId') productId: string,
        @Body() setStockDto: SetStockDto,
    ) {
        return this.inventoryService.setStock(productId, setStockDto);
    }

    @Patch('product/:productId/settings')
    @ApiOperation({ summary: 'Update inventory settings (minStock, maxStock, location)' })
    updateSettings(
        @Param('productId') productId: string,
        @Body() settingsDto: UpdateInventorySettingsDto,
    ) {
        return this.inventoryService.updateSettings(productId, settingsDto);
    }
}
