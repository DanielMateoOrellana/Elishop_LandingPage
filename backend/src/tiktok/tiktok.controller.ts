import { Controller, Get, Post, Body } from '@nestjs/common';
import { TikTokService } from './tiktok.service';
import { UpdateTikTokVideosDto } from './dto/tiktok.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tiktok')
export class TikTokController {
    constructor(private readonly service: TikTokService) { }

    @Public()
    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Post()
    update(@Body() dto: UpdateTikTokVideosDto) {
        // Asumiendo AuthGuard global o que se use @UseGuards() en main o app module
        return this.service.updateAll(dto);
    }
}
