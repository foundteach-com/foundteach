import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('🔧 Iniciando FoundTeach API...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Prefijo global para todos los endpoints, excepto health
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configurado para ser más robusto
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*';

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 FoundTeach API corriendo en puerto ${port}`);
  logger.log(`📋 Health check disponible en /health`);
  logger.log(`📋 API endpoints en /api`);
}

bootstrap().catch((err) => {
  console.error('❌ Error fatal iniciando la API:', err);
  process.exit(1);
});
