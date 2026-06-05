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
   * 5. Si algún stat bajó más de 15 puntos, descuenta una vida (Opción A).
   */
  async makeDecision(dto: MakeDecisionDto) {
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

    const cambiosAtributos = (option.cambiosEnAtributos as Record<string, number>) || {};
    const statsUpdate: Record<string, number> = {};
    let perdioVida = false;

    for (const field of RDV_STAT_FIELDS) {
      if (cambiosAtributos[field] !== undefined) {
        const currentValue = character.stats[field as RdvStatField];
        const delta = cambiosAtributos[field];
        statsUpdate[field] = this.clamp(currentValue + delta);
        if (delta <= -15) {
          perdioVida = true;
        }
      }
    }

    const cambiosContexto = (option.cambiosEnContexto as Record<string, number>) || {};
    const contextUpdate: Record<string, number> = {};

    for (const field of RDV_CONTEXT_FIELDS) {
      if (cambiosContexto[field] !== undefined) {
        const currentValue = character.context[field as RdvContextField];
        contextUpdate[field] = this.clamp(currentValue + cambiosContexto[field]);
      }
    }

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

    const result = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(statsUpdate).length > 0) {
        await tx.rdvStats.update({
          where: { characterId: dto.characterId },
          data: statsUpdate,
        });
      }

      if (Object.keys(contextUpdate).length > 0) {
        await tx.rdvContext.update({
          where: { characterId: dto.characterId },
          data: contextUpdate,
        });
      }

      for (const relUpdate of relationshipUpdates) {
        await tx.rdvRelationship.update({
          where: { id: relUpdate.id },
          data: { valor: relUpdate.valor },
        });
      }

      const characterUpdate: Record<string, any> = {
        xp: { increment: character.xpBoostCharges > 0 ? 20 : 10 },
        monedas: { increment: 5 },
      };

      if (character.xpBoostCharges > 0) {
        characterUpdate.xpBoostCharges = { decrement: 1 };
      }

      let vidaRestada = false;
      if (perdioVida && character.vidas > 0) {
        if (character.escudoRacha) {
          characterUpdate.escudoRacha = false;
          perdioVida = false; // Evitamos la penalización visual en la UI
        } else {
          characterUpdate.vidas = { decrement: 1 };
          vidaRestada = true;
        }
      }

      await tx.rdvCharacter.update({
        where: { id: dto.characterId },
        data: characterUpdate,
      });

      await tx.rdvProgress.create({
        data: {
          characterId: dto.characterId,
          decisionId: dto.decisionId,
          optionId: dto.optionId,
        },
      });

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
      `✅ Decisión "${decision.titulo}" tomada por ${character.nombre}${perdioVida ? ' — ❤️ -1 vida' : ''}`,
    );

    return { ...result, perdioVida };
  }

  /**
   * Historial de decisiones de un personaje.
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
   * Resumen completo del estado actual del personaje (incluye vidas).
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
        xp: character.xp,
        monedas: character.monedas,
        vidas: character.vidas,
        escudoRacha: character.escudoRacha,
        xpBoostCharges: character.xpBoostCharges,
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

  /**
   * Avanza a la siguiente etapa de la vida.
   * Genera una decisión de consecuencia y otorga bonus.
   */
  async advanceStage(characterId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
      include: { stats: true, context: true },
    });

    if (!character) throw new NotFoundException('Personaje no encontrado');

    const stages = [
      'EARLY_CHILDHOOD',
      'CHILDHOOD',
      'ADOLESCENCE',
      'YOUTH',
      'ADULTHOOD',
      'OLD_AGE'
    ];

    const currentIndex = stages.indexOf(character.etapaActual);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      throw new BadRequestException('El personaje ya está en la última etapa o la etapa es inválida');
    }

    const nextStage = stages[currentIndex + 1] as any;

    // Generar consecuencia basada en stats
    let consecuenciaTexto = 'Has crecido y una nueva etapa comienza.';
    if (character.stats) {
      const stats = character.stats as unknown as Record<string, number>;
      const statKeys = RDV_STAT_FIELDS;
      let maxStat: RdvStatField = statKeys[0];
      let minStat: RdvStatField = statKeys[0];

      for (const key of statKeys) {
        if (stats[key] > stats[maxStat]) maxStat = key;
        if (stats[key] < stats[minStat]) minStat = key;
      }

      consecuenciaTexto = `Al iniciar esta nueva etapa, tu gran desarrollo en el área ${maxStat.toUpperCase()} te abre nuevas puertas, pero tu descuido en el área ${minStat.toUpperCase()} te presenta un reto inmediato. ¿Cómo decides afrontarlo?`;
    }

    // Crear la decisión de consecuencia personalizada
    await this.prisma.rdvDecision.create({
      data: {
        etapa: nextStage,
        titulo: `[CONSECUENCIA:${characterId}] El paso del tiempo...`,
        descripcion: consecuenciaTexto,
        isActive: false, // Para que no salga en el pool general
        sortOrder: -1,
        options: {
          create: [
            {
              texto: 'Afrontar el reto de frente (Equilibrar stats)',
              cambiosEnAtributos: { fisico: 2, cognitivo: 2, social: 2 },
            },
            {
              texto: 'Apoyarme en mis fortalezas (Potenciar virtudes)',
              cambiosEnAtributos: { afectivo: 5, etico: 5 },
            }
          ]
        }
      }
    });

    const updated = await this.prisma.rdvCharacter.update({
      where: { id: characterId },
      data: {
        etapaActual: nextStage,
        vidas: 5,
        xp: { increment: 50 },
        monedas: { increment: 20 },
      },
    });

    this.logger.log(`🌟 ${character.nombre} avanzó a ${nextStage}. Consecuencia generada.`);
    return updated;
  }

  /**
   * Compra items en la tienda.
   */
  async buyItem(characterId: string, itemId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) throw new NotFoundException('Personaje no encontrado');

    const ITEMS: Record<string, { precio: number, tipo: string, cantidad?: number }> = {
      vida_1: { precio: 10, tipo: 'vida', cantidad: 1 },
      vida_3: { precio: 25, tipo: 'vida', cantidad: 3 },
      vidas_max: { precio: 40, tipo: 'vida', cantidad: 5 },
      escudo_racha: { precio: 30, tipo: 'escudo' },
      xp_x2: { precio: 50, tipo: 'xpx2', cantidad: 10 },
      descanso_gratis: { precio: 0, tipo: 'descanso' },
    };

    const item = ITEMS[itemId];
    if (!item) throw new BadRequestException('Item inválido');

    if (character.monedas < item.precio) {
      throw new BadRequestException(
        `No tienes suficientes monedas. Necesitas ${item.precio} y tienes ${character.monedas}.`
      );
    }

    const updateData: Record<string, any> = {
      monedas: { decrement: item.precio },
    };

    if (item.tipo === 'vida') {
      const vidasARecuperar = Math.min(item.cantidad!, 5 - character.vidas);
      if (vidasARecuperar <= 0) {
        throw new BadRequestException('Ya tienes el máximo de vidas (5).');
      }
      updateData.vidas = { increment: vidasARecuperar };
    } else if (item.tipo === 'escudo') {
      if (character.escudoRacha) {
        throw new BadRequestException('Ya tienes el escudo de racha activo.');
      }
      updateData.escudoRacha = true;
    } else if (item.tipo === 'xpx2') {
      updateData.xpBoostCharges = { increment: item.cantidad };
    } else if (item.tipo === 'descanso') {
      const vidasARecuperar = Math.min(1, 5 - character.vidas);
      if (vidasARecuperar <= 0) {
        throw new BadRequestException('Ya tienes el máximo de vidas (5).');
      }
      updateData.vidas = { increment: vidasARecuperar };
      
      // Penalización por descansar gratis
      if (character.xp >= 15) {
        updateData.xp = { decrement: 15 };
      } else {
        updateData.xp = 0;
      }
    }

    return this.prisma.rdvCharacter.update({
      where: { id: characterId },
      data: updateData,
    });
  }

  /**
   * Tabla de clasificación: personajes ordenados por XP.
   */
  async getLeaderboard() {
    return this.prisma.rdvCharacter.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nombre: true,
        genero: true,
        etapaActual: true,
        xp: true,
        monedas: true,
      },
      orderBy: { xp: 'desc' },
      take: 50,
    });
  }

  /**
   * Calcula los logros desbloqueados de un personaje basándose en su progreso real.
   */
  async getLogros(characterId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
      include: {
        stats: true,
        _count: { select: { progress: true } },
      },
    });

    if (!character) throw new NotFoundException('Personaje no encontrado');

    const decisionsCount = character._count.progress;
    const STAGES_ORDER = ['EARLY_CHILDHOOD', 'CHILDHOOD', 'ADOLESCENCE', 'YOUTH', 'ADULTHOOD', 'OLD_AGE'];
    const currentStageIndex = STAGES_ORDER.indexOf(character.etapaActual);

    const logros = [
      {
        id: 'primeros_pasos',
        title: 'Primeros Pasos',
        desc: 'Completaste tu primera decisión.',
        emoji: '⭐',
        color: 'bg-yellow-400',
        unlocked: decisionsCount >= 1,
      },
      {
        id: 'corazon_de_oro',
        title: 'Corazón de Oro',
        desc: 'Alcanzaste 70 en Afectivo.',
        emoji: '❤️',
        color: 'bg-pink-400',
        unlocked: (character.stats?.afectivo ?? 0) >= 70,
      },
      {
        id: 'mente_brillante',
        title: 'Mente Brillante',
        desc: 'Alcanzaste 70 en Cognitivo.',
        emoji: '🧠',
        color: 'bg-sky-400',
        unlocked: (character.stats?.cognitivo ?? 0) >= 70,
      },
      {
        id: 'racha_semanal',
        title: 'Racha Imparable',
        desc: 'Tomaste 7 o más decisiones.',
        emoji: '⚡',
        color: 'bg-orange-400',
        unlocked: decisionsCount >= 7,
      },
      {
        id: 'creciendo',
        title: 'Creciendo',
        desc: 'Avanzaste más allá de la Primera Infancia.',
        emoji: '🌱',
        color: 'bg-[#58CC02]',
        unlocked: currentStageIndex >= 1,
      },
      {
        id: 'sabio',
        title: 'El Gran Sabio',
        desc: 'Alcanzaste la etapa de Vejez.',
        emoji: '🏆',
        color: 'bg-purple-500',
        unlocked: character.etapaActual === 'OLD_AGE',
      },
    ];

    return { logros, decisionsCount, etapaActual: character.etapaActual };
  }
}
