import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MakeDecisionDto } from '../dto';
import {
  RDV_STAT_FIELDS,
  RDV_CONTEXT_FIELDS,
  RdvStatField,
  RdvContextField,
} from '../interfaces/rdv.interfaces';

@Injectable()
export class RdvProgressService {
  private readonly logger = new Logger(RdvProgressService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Fija un valor entre 0 y 100.
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  /**
   * Procesa la toma de una decisión:
   * 1. Valida que la decisión corresponda a la etapa actual del personaje.
   * 2. Aplica cambios a stats, context y relationships.
   * 3. Registra el progreso.
   * 4. Clampea todos los valores entre 0 y 100.
   */
  async makeDecision(dto: MakeDecisionDto) {
    // 1. Obtener personaje con su estado actual
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: dto.characterId },
      include: {
        stats: true,
        context: true,
        relationships: true,
      },
    });

    if (!character) {
      throw new NotFoundException('Personaje no encontrado');
    }

    if (!character.stats || !character.context) {
      throw new BadRequestException(
        'El personaje no tiene stats o contexto inicializados',
      );
    }

    // 2. Obtener la decisión y verificar la etapa
    const decision = await this.prisma.rdvDecision.findUnique({
      where: { id: dto.decisionId },
    });

    if (!decision) {
      throw new NotFoundException('Decisión no encontrada');
    }

    if (decision.etapa !== character.etapaActual) {
      throw new BadRequestException(
        `Esta decisión es para la etapa "${decision.etapa}", pero el personaje está en "${character.etapaActual}"`,
      );
    }

    // 3. Obtener la opción seleccionada
    const option = await this.prisma.rdvOption.findUnique({
      where: { id: dto.optionId },
    });

    if (!option) {
      throw new NotFoundException('Opción no encontrada');
    }

    if (option.decisionId !== dto.decisionId) {
      throw new BadRequestException(
        'La opción no pertenece a la decisión indicada',
      );
    }

    // 4. Calcular cambios en stats
    const cambiosAtributos = (option.cambiosEnAtributos as Record<string, number>) || {};
    const statsUpdate: Record<string, number> = {};

    for (const field of RDV_STAT_FIELDS) {
      if (cambiosAtributos[field] !== undefined) {
        const currentValue = character.stats[field as RdvStatField];
        statsUpdate[field] = this.clamp(currentValue + cambiosAtributos[field]);
      }
    }

    // 5. Calcular cambios en context
    const cambiosContexto = (option.cambiosEnContexto as Record<string, number>) || {};
    const contextUpdate: Record<string, number> = {};

    for (const field of RDV_CONTEXT_FIELDS) {
      if (cambiosContexto[field] !== undefined) {
        const currentValue = character.context[field as RdvContextField];
        contextUpdate[field] = this.clamp(currentValue + cambiosContexto[field]);
      }
    }

    // 6. Calcular cambios en relationships
    const cambiosRelaciones = (option.cambiosEnRelaciones as Record<string, number>) || {};
    const relationshipUpdates: Array<{ id: string; valor: number }> = [];

    for (const rel of character.relationships) {
      if (cambiosRelaciones[rel.tipoRelacion] !== undefined) {
        relationshipUpdates.push({
          id: rel.id,
          valor: this.clamp(rel.valor + cambiosRelaciones[rel.tipoRelacion]),
        });
      }
    }

    // 7. Aplicar todos los cambios en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Actualizar stats
      if (Object.keys(statsUpdate).length > 0) {
        await tx.rdvStats.update({
          where: { characterId: dto.characterId },
          data: statsUpdate,
        });
      }

      // Actualizar context
      if (Object.keys(contextUpdate).length > 0) {
        await tx.rdvContext.update({
          where: { characterId: dto.characterId },
          data: contextUpdate,
        });
      }

      // Actualizar relationships
      for (const relUpdate of relationshipUpdates) {
        await tx.rdvRelationship.update({
          where: { id: relUpdate.id },
          data: { valor: relUpdate.valor },
        });
      }

      // Registrar progreso
      const progress = await tx.rdvProgress.create({
        data: {
          characterId: dto.characterId,
          decisionId: dto.decisionId,
          optionId: dto.optionId,
        },
      });

      // Retornar el personaje actualizado
      return tx.rdvCharacter.findUnique({
        where: { id: dto.characterId },
        include: {
          stats: true,
          context: true,
          relationships: true,
        },
      });
    });

    this.logger.log(
      `✅ Decisión "${decision.titulo}" tomada por personaje ${character.nombre}`,
    );

    return result;
  }

  /**
   * Obtiene el historial de decisiones de un personaje.
   */
  async getHistory(characterId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Personaje no encontrado');
    }

    return this.prisma.rdvProgress.findMany({
      where: { characterId },
      include: {
        decision: true,
        option: true,
      },
      orderBy: { fecha: 'asc' },
    });
  }

  /**
   * Resumen completo del estado actual del personaje.
   */
  async getSummary(characterId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
      include: {
        stats: true,
        context: true,
        relationships: {
          orderBy: { tipoRelacion: 'asc' },
        },
        _count: {
          select: { progress: true },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Personaje no encontrado');
    }

    return {
      character: {
        id: character.id,
        nombre: character.nombre,
        genero: character.genero,
        etapaActual: character.etapaActual,
      },
      stats: character.stats,
      context: character.context,
      relationships: character.relationships.map((r) => ({
        tipo: r.tipoRelacion,
        valor: r.valor,
      })),
      decisionsCount: character._count.progress,
    };
  }
}
