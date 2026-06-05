import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RdvSimulationEngineService {
  private readonly logger = new Logger(RdvSimulationEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generación Pasiva (Lazy Evaluation).
   * Calcula el tiempo transcurrido desde updatedAt y otorga recursos.
   * Rates base:
   * - 1 XP por minuto.
   * - 1 Moneda por cada 2 minutos.
   * Multiplicadores basados en estadísticas.
   */
  async evaluatePassiveProgress(characterId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
      include: { stats: true, context: true },
    });

    if (!character || !character.stats || !character.context) return;

    const now = new Date();
    // updatedAt puede cambiar por cualquier guardado, para ser más exactos
    // deberíamos tener un campo `lastPassiveEvalAt`, pero usaremos updatedAt por ahora
    // si la diferencia es mayor a 1 minuto, evaluamos.
    
    // Evitar evaluar múltiples veces en el mismo segundo
    const diffMs = now.getTime() - character.updatedAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return; // No hay progreso pasivo suficiente

    // Limitar la generación pasiva offline a un máximo de 8 horas (480 minutos)
    // para incentivar la conexión del jugador.
    const effectiveMinutes = Math.min(diffMinutes, 480);

    // Multiplicadores (ej: si tienes alto cognitivo, ganas más XP)
    const cognitivoMult = 1 + (character.stats.cognitivo / 100);
    const socialMult = 1 + (character.stats.social / 100);

    const xpGained = Math.floor(effectiveMinutes * 1 * cognitivoMult);
    const monedasGained = Math.floor((effectiveMinutes * 0.5) * socialMult);

    await this.prisma.rdvCharacter.update({
      where: { id: characterId },
      data: {
        xp: { increment: xpGained },
        monedas: { increment: monedasGained },
        updatedAt: now, // Reseteamos el contador
      },
    });

    this.logger.debug(
      `[Tycoon] Generación pasiva para ${character.nombre}: +${xpGained} XP, +${monedasGained} Monedas (${effectiveMinutes} min offline)`,
    );
  }
}
