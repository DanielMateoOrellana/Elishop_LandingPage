import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateTikTokVideosDto } from './dto/tiktok.dto';

@Injectable()
export class TikTokService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tikTokVideo.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }

    async updateAll(dto: UpdateTikTokVideosDto) {
        // Borrar todo y crear nuevos
        return this.prisma.$transaction(async (tx) => {
            await tx.tikTokVideo.deleteMany();

            const validUrls = dto.videos.filter(v => v.trim() !== '').slice(0, 5); // Max 5

            for (let i = 0; i < validUrls.length; i++) {
                await tx.tikTokVideo.create({
                    data: {
                        url: validUrls[i],
                        sortOrder: i,
                    }
                });
            }

            return tx.tikTokVideo.findMany({ orderBy: { sortOrder: 'asc' } });
        });
    }
}
