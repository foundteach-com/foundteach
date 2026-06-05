import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RdvReportService {
  private readonly logger = new Logger(RdvReportService.name);

  constructor(private prisma: PrismaService) {}

  async generateLifeReport(characterId: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id: characterId },
      include: {
        stats: true,
        context: true,
        relationships: true,
      },
    });

    if (!character || !character.stats || !character.context) {
      throw new NotFoundException('Personaje no encontrado o sin inicializar');
    }

    // Análisis básico de las dimensiones para generar un reporte narrativo
    const { cognitivo, fisico, social, afectivo, etico, comunicativo } = character.stats;

    let reporteNarrativo = `Informe de Desarrollo Humano de ${character.nombre}\n\n`;

    // Cognitivo
    if (cognitivo > 80) {
      reporteNarrativo += '🧠 Dimensión Cognitiva: Sobresaliente. Has desarrollado un pensamiento crítico y una capacidad de resolución de problemas excepcional.\n';
    } else if (cognitivo < 40) {
      reporteNarrativo += '🧠 Dimensión Cognitiva: Necesita atención. Hubo dificultades en el aprendizaje y adaptación a nuevos retos.\n';
    } else {
      reporteNarrativo += '🧠 Dimensión Cognitiva: Adecuada. Tienes un desarrollo intelectual equilibrado.\n';
    }

    // Afectivo
    if (afectivo > 80) {
      reporteNarrativo += '❤️ Dimensión Afectiva: Excelente. Posees gran inteligencia emocional, autoestima sólida y empatía.\n';
    } else if (afectivo < 40) {
      reporteNarrativo += '❤️ Dimensión Afectiva: Vulnerable. Experimentaste inseguridades y dependencia emocional significativa.\n';
    } else {
      reporteNarrativo += '❤️ Dimensión Afectiva: Estable. Lograste mantener relaciones afectivas sanas la mayor parte del tiempo.\n';
    }

    // Físico
    if (fisico > 80) {
      reporteNarrativo += '🏃 Dimensión Física: Óptima. Priorizaste tu salud, nutrición y bienestar corporal.\n';
    } else if (fisico < 40) {
      reporteNarrativo += '🏃 Dimensión Física: Descuidada. El sedentarismo o problemas de salud marcaron tu trayectoria.\n';
    } else {
      reporteNarrativo += '🏃 Dimensión Física: Normal. Mantuviste un estado de salud promedio sin mayores complicaciones.\n';
    }

    reporteNarrativo += '\n📊 Conclusión Ecológica Sistémica:\n';
    
    // Análisis del Microsistema
    const { familia, escuela, amigos } = character.context;
    if (familia > 70 && escuela > 70) {
      reporteNarrativo += 'Tu Microsistema fue una red de apoyo fuerte. La sinergia entre tu familia y escuela potenció tu desarrollo.\n';
    } else if (familia < 40 && amigos > 70) {
      reporteNarrativo += 'Ante la carencia de apoyo familiar, encontraste en tus amigos un refugio crucial para tu desarrollo social.\n';
    } else if (familia < 40 && escuela < 40) {
      reporteNarrativo += 'Enfrentaste un Microsistema adverso. Las tensiones en casa y en la escuela limitaron tus oportunidades iniciales.\n';
    } else {
      reporteNarrativo += 'Tu entorno más cercano (familia, amigos, escuela) te brindó un apoyo moderado a lo largo de tu vida.\n';
    }

    return {
      characterId: character.id,
      nombre: character.nombre,
      reporteNarrativo,
      finalStats: character.stats,
      finalContext: character.context,
    };
  }
}
