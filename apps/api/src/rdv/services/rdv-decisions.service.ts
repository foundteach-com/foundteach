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
   */
  async findAll(stage?: RdvLifeStage) {
    return this.prisma.rdvDecision.findMany({
      where: {
        isActive: true,
        ...(stage ? { etapa: stage } : {}),
      },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
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
