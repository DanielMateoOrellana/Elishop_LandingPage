import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        console.log('DB URL (FULL):', process.env.DATABASE_URL);
        await this.$connect();
        console.log('✅ Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
