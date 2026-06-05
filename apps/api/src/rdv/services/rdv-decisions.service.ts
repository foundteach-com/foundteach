import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RdvLifeStage } from '@prisma/client';
import { CreateDecisionDto } from '../dto';

@Injectable()
export class RdvDecisionsService {
  private readonly logger = new Logger(RdvDecisionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crea una decisión con sus opciones en una sola operación.
   */
  async create(dto: CreateDecisionDto) {
    const decision = await this.prisma.rdvDecision.create({
      data: {
        etapa: dto.etapa,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        requisitos: dto.requisitos ? dto.requisitos : {},
        options: dto.opciones
          ? {
              create: dto.opciones.map((opt, index) => ({
                texto: opt.texto,
                cambiosEnAtributos: opt.cambiosEnAtributos ?? {},
                cambiosEnContexto: opt.cambiosEnContexto ?? {},
                cambiosEnRelaciones: opt.cambiosEnRelaciones ?? {},
                sortOrder: opt.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: { options: true },
    });

    this.logger.log(
      `✅ Decisión "${decision.titulo}" creada para etapa ${decision.etapa}`,
    );
    return decision;
  }

  /**
   * Lista decisiones, opcionalmente filtradas por etapa del ciclo vital.
   * Si se proporciona characterId, selecciona 10 decisiones aleatorias de forma determinista y agrega la consecuencia si existe.
   */
  async findAll(stage?: RdvLifeStage, characterId?: string) {
    // 1. Obtener todas las decisiones activas de la etapa
    let decisions = await this.prisma.rdvDecision.findMany({
      where: {
        isActive: true,
        ...(stage ? { etapa: stage } : {}),
      },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });

    if (characterId) {
      // 2. Filtrar por requisitos (Estadísticas e Historial de decisiones)
      const [characterStats, characterProgress] = await Promise.all([
        this.prisma.rdvStats.findUnique({ where: { characterId } }),
        this.prisma.rdvProgress.findMany({ where: { characterId } })
      ]);
      const takenDecisionIds = new Set(characterProgress.map((p) => p.decisionId));

      decisions = decisions.filter((d) => {
        if (!d.requisitos || typeof d.requisitos !== 'object') return true;
        const reqs = d.requisitos as any;

        // 2a. Validar estadísticas mínimas
        if (reqs.minStats && characterStats) {
          for (const [statName, valueRequired] of Object.entries(reqs.minStats)) {
            const currentVal = (characterStats as any)[statName] || 0;
            if (currentVal < (valueRequired as number)) return false;
          }
        }

        // 2b. Validar decisiones previas requeridas
        if (reqs.requiredDecisions && Array.isArray(reqs.requiredDecisions)) {
          for (const reqId of reqs.requiredDecisions) {
            if (!takenDecisionIds.has(reqId)) return false;
          }
        }

        // 2c. Validar decisiones previas excluyentes
        if (reqs.excludedDecisions && Array.isArray(reqs.excludedDecisions)) {
          for (const exclId of reqs.excludedDecisions) {
            if (takenDecisionIds.has(exclId)) return false;
          }
        }

        return true;
      });

      // 3. Orden determinista
      const hash = (str: string) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
          h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        }
        return h;
      };

      decisions.sort((a, b) => hash(a.id + characterId) - hash(b.id + characterId));
      decisions = decisions.slice(0, 10); // Aseguramos que haya máximo 10 aleatorias

      // 4. Buscar si hay una decisión de consecuencia para este personaje en esta etapa
      const consequence = await this.prisma.rdvDecision.findFirst({
        where: {
          isActive: false,
          titulo: `[CONSECUENCIA:${characterId}] El paso del tiempo...`,
          etapa: stage,
        },
        include: { options: { orderBy: { sortOrder: 'asc' } } },
      });

      if (consequence) {
        // Reemplazar la primera decisión aleatoria por la consecuencia, manteniendo el total en 10
        decisions.pop(); 
        decisions.unshift(consequence);
      }
    }

    return decisions;
  }

  /**
   * Obtiene una decisión con sus opciones.
   */
  async findOne(id: string) {
    const decision = await this.prisma.rdvDecision.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!decision) {
      throw new NotFoundException('Decisión no encontrada');
    }

    return decision;
  }

  /**
   * Actualiza una decisión (sin opciones — se gestionan por separado si es necesario).
   */
  async update(id: string, dto: Partial<CreateDecisionDto>) {
    await this.findOne(id);
    const { opciones, ...data } = dto;

    return this.prisma.rdvDecision.update({
      where: { id },
      data,
      include: { options: true },
    });
  }

  /**
   * Elimina una decisión y sus opciones en cascada.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rdvDecision.delete({ where: { id } });
  }
}
