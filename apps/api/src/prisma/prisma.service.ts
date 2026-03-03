import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Conectado a la base de datos');
        return;
      } catch (error) {
        retries--;
        this.logger.warn(
          `⚠️ Error conectando a la DB. Reintentos restantes: ${retries}`,
        );
        if (retries === 0) {
          this.logger.error(
            '❌ No se pudo conectar a la base de datos después de 5 intentos',
            error instanceof Error ? error.message : String(error),
          );
          throw error;
        }
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise((resolve) =>
          setTimeout(resolve, (5 - retries) * 2000),
        );
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Desconectado de la base de datos');
  }
}
