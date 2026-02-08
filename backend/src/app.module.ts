import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modules
import { PrismaModule } from './prisma';
import { AuthModule, JwtAuthGuard } from './auth';

// Feature modules
import { CategoriesModule } from './categories';
import { ProductsModule } from './products';
import { InventoryModule } from './inventory';
import { UploadsModule } from './uploads/uploads.module';
import { TikTokModule } from './tiktok/tiktok.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core
    PrismaModule,
    AuthModule,

    // Features
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    UploadsModule,
    TikTokModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Guard - all routes protected by default
    // Use @Public() decorator to make specific routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
