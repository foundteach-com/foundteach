import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterPlayerDto } from '../dto';

@Injectable()
export class RdvPlayersService {
  private readonly logger = new Logger(RdvPlayersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registra un nuevo jugador de Rutas de Vida.
   * Crea un User con rol STUDENT y sin contraseña real (preparado para JWT futuro).
   */
  async register(dto: RegisterPlayerDto) {
    // Verificar si ya existe por email
    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    // Verificar si ya existe por código estudiantil
    const existingByCode = await this.prisma.user.findUnique({
      where: { studentCode: dto.codigoEstudiantil },
    });
    if (existingByCode) {
      throw new ConflictException('Ya existe un usuario con ese código estudiantil');
    }

    // Separar nombre en firstName y lastName
    const parts = dto.nombre.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || dto.nombre;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: 'rdv-pending', // Placeholder — se implementará JWT después
        firstName,
        lastName,
        role: 'STUDENT',
        studentCode: dto.codigoEstudiantil,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studentCode: true,
        createdAt: true,
      },
    });

    this.logger.log(`✅ Jugador registrado: ${user.email} (${user.studentCode})`);
    return user;
  }

  /**
   * Login simplificado: busca al usuario por email o código estudiantil.
   * Sin contraseña por ahora — estructura preparada para JWT futuro.
   */
  async login(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { studentCode: identifier }],
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studentCode: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'No se encontró un jugador con ese correo o código estudiantil',
      );
    }

    return user;
  }

  /**
   * Obtener perfil completo de un jugador con sus personajes.
   */
  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studentCode: true,
        isActive: true,
        createdAt: true,
        rdvCharacters: {
          where: { isActive: true },
          select: {
            id: true,
            nombre: true,
            genero: true,
            etapaActual: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Jugador no encontrado');
    }

    return user;
  }
}
