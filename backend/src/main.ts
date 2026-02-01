import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  console.log('--- ENV CHECK ---');
  console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? 'Set' : 'Missing');
  console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing');
  console.log('--- END ENV CHECK ---');

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin === '*'
    ? '*'
    : corsOrigin
      ? corsOrigin.split(',').map(url => url.trim().replace(/\/$/, ''))
      : ['http://localhost:5173', 'http://localhost:3000'];

  console.log('--- CORS CONFIG ---');
  console.log('Allowed Origins:', allowedOrigins);
  console.log('--- END CORS CONFIG ---');

  app.enableCors({
    origin: (requestOrigin: string, callback: Function) => {
      // Permitir requests sin 'origin' (ej: Postman, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

      // Si la variable es '*', permitir todo dinámicamente
      if (allowedOrigins === '*') return callback(null, true);

      // Verificar si el origen está en la lista permitida
      if (Array.isArray(allowedOrigins) && allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS request from origin: ${requestOrigin}`);
      callback(null, false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Elishop API')
    .setDescription('API para el sistema de inventario y e-commerce de Elishop')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Categories', 'Product categories')
    .addTag('Products', 'Product management')
    .addTag('Inventory', 'Inventory management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
🚀 Elishop API running on: http://localhost:${port}
📚 Swagger docs: http://localhost:${port}/api/docs
  `);
}
bootstrap();
