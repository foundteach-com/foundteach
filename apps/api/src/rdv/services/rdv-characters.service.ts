import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCharacterDto, UpdateCharacterDto } from '../dto';
import { RDV_RELATIONSHIP_TYPES } from '../interfaces/rdv.interfaces';

@Injectable()
export class RdvCharactersService {
  private readonly logger = new Logger(RdvCharactersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crea un personaje con todos sus registros asociados:
   * - RdvStats (6 atributos en 50)
   * - RdvContext (5 variables en 50)
   * - 7 RdvRelationships (todas en 50)
   */
  async create(dto: CreateCharacterDto) {
    let userId = dto.userId || null;

    if (dto.studentCode?.trim()) {
      const normalizedCode = dto.studentCode.trim().toUpperCase();
      let user = await this.prisma.user.findUnique({
        where: { studentCode: normalizedCode },
      });

      if (!user) {
        const safeEmailPrefix = normalizedCode.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user';
        user = await this.prisma.user.create({
          data: {
            email: `${safeEmailPrefix}@guest.foundteach.com`,
            password: 'rdv-pending',
            firstName: dto.nombre.trim().split(/\s+/)[0] || 'Jugador',
            lastName: dto.nombre.trim().split(/\s+/).slice(1).join(' ') || dto.nombre.trim(),
            role: 'STUDENT',
            studentCode: normalizedCode,
          },
        });
      }

      userId = user.id;
    }

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
    }

    const character = await this.prisma.rdvCharacter.create({
      data: {
        userId,
        nombre: dto.nombre,
        genero: dto.genero,
        etapaActual: 'EARLY_CHILDHOOD',
        stats: {
          create: {
            fisico: 50,
            cognitivo: 50,
            social: 50,
            afectivo: 50,
            etico: 50,
            comunicativo: 50,
          },
        },
        context: {
          create: {
            familia: 50,
            escuela: 50,
            amigos: 50,
            comunidad: 50,
            sociedad: 50,
          },
        },
        relationships: {
          create: RDV_RELATIONSHIP_TYPES.map((tipo) => ({
            tipoRelacion: tipo,
            valor: 50,
          })),
        },
      },
      include: {
        stats: true,
        context: true,
        relationships: true,
      },
    });

    this.logger.log(
      `✅ Personaje "${character.nombre}" creado para usuario ${dto.userId}`,
    );
    return character;
  }

  /**
   * Lista todos los personajes activos de un usuario.
   */
  async findByUser(userId: string) {
    return this.prisma.rdvCharacter.findMany({
      where: { userId, isActive: true },
      include: {
        stats: true,
        context: true,
        relationships: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene un personaje completo con stats, context y relationships.
   */
  async findOne(id: string) {
    const character = await this.prisma.rdvCharacter.findUnique({
      where: { id },
      include: {
        stats: true,
        context: true,
        relationships: true,
        progress: {
          include: { decision: true, option: true },
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Personaje no encontrado');
    }

    return character;
  }

  /**
   * Actualiza datos básicos de un personaje.
   */
  async update(id: string, dto: UpdateCharacterDto) {
    await this.findOne(id);
    return this.prisma.rdvCharacter.update({
      where: { id },
      data: dto,
      include: {
        stats: true,
        context: true,
        relationships: true,
      },
    });
  }

  /**
   * Soft delete — marca el personaje como inactivo.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rdvCharacter.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
