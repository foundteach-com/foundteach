import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  // Escuchar en 0.0.0.0 para que Railway pueda acceder al servidor
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 FoundTeach API corriendo en http://0.0.0.0:${port}`);
  console.log(`📋 Health check: http://0.0.0.0:${port}/health`);
  console.log(`📋 API endpoints: http://0.0.0.0:${port}/api`);
}
bootstrap().catch((err) => {
  console.error('❌ Error iniciando la API:', err);
});
