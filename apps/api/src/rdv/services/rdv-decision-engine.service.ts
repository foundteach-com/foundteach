import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RdvLifeStage } from '@prisma/client';

@Injectable()
export class RdvDecisionEngineService {
  private readonly logger = new Logger(RdvDecisionEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Evalúa el contexto del personaje e inyecta decisiones dinámicas en su pool.
   * Por ejemplo, si el contexto 'familia' es muy bajo, genera un dilema.
   */
  async injectDynamicDecisions(characterId: string, stage: RdvLifeStage) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
      include: { context: true },
    });

    if (!character || !character.context) return;

    // Verificar si ya existe una decisión inyectada dinámica activa para no saturar
    const existingDynamic = await this.prisma.rdvDecision.findFirst({
      where: {
        isActive: false, // Las dinámicas las marcamos como inactivas para el pool global
        titulo: { startsWith: `[DILEMA:${characterId}]` },
        etapa: stage,
      },
    });

    // Si ya tiene un dilema pendiente, no inyectamos otro
    if (existingDynamic) {
        // Pero primero verificamos si ya la tomó
        const taken = await this.prisma.rdvProgress.findFirst({
            where: { characterId, decisionId: existingDynamic.id }
        });
        if (!taken) return; 
    }

    // Regla 1: Familia muy baja
    if (character.context.familia < 30) {
      this.logger.log(`Inyectando dilema familiar para ${character.nombre}`);
      await this.prisma.rdvDecision.create({
        data: {
          etapa: stage,
          titulo: `[DILEMA:${characterId}] Tensión en casa`,
          descripcion: 'El ambiente en tu hogar es muy tenso últimamente. Tus padres discuten a menudo y sientes que no tienes apoyo.',
          isActive: false, // Solo para este personaje
          sortOrder: -10, // Prioridad alta
          options: {
            create: [
              {
                texto: 'Intentar mediar y hablar de cómo te sientes',
                cambiosEnAtributos: { afectivo: 5, comunicativo: 5 },
                cambiosEnContexto: { familia: 15 },
              },
              {
                texto: 'Encerrarte en tu cuarto y evitar el problema',
                cambiosEnAtributos: { afectivo: -5 },
                cambiosEnContexto: { familia: -5 },
              },
              {
                texto: 'Buscar refugio en tus amigos',
                cambiosEnAtributos: { social: 5 },
                cambiosEnContexto: { familia: -10, amigos: 10 },
              }
            ]
          }
        }
      });
      return;
    }

    // Regla 2: Escuela muy baja (Aplica de CHILDHOOD en adelante)
    if (character.context.escuela < 30 && stage !== 'EARLY_CHILDHOOD' && stage !== 'OLD_AGE') {
        this.logger.log(`Inyectando dilema escolar para ${character.nombre}`);
        await this.prisma.rdvDecision.create({
          data: {
            etapa: stage,
            titulo: `[DILEMA:${characterId}] Problemas académicos`,
            descripcion: 'Tus notas han bajado drásticamente y un profesor quiere hablar contigo sobre tu falta de compromiso.',
            isActive: false,
            sortOrder: -10,
            options: {
              create: [
                {
                  texto: 'Asumir la responsabilidad y pedir ayuda extra',
                  cambiosEnAtributos: { cognitivo: 10, etico: 5 },
                  cambiosEnContexto: { escuela: 20 },
                },
                {
                  texto: 'Poner excusas y no hacer nada al respecto',
                  cambiosEnAtributos: { cognitivo: -5, etico: -5 },
                  cambiosEnContexto: { escuela: -10 },
                }
              ]
            }
          }
        });
        return;
    }
  }
}
