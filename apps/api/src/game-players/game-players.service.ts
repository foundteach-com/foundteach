import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertGamePlayerDto } from './dto/upsert-game-player.dto';
import { UpdateGamePlayerAdminDto } from './dto/update-game-player-admin.dto';

@Injectable()
export class GamePlayersService {
  constructor(private prisma: PrismaService) {}

  // ── Public: game saves/updates player progress ──────────────────────────────
  async upsert(dto: UpsertGamePlayerDto) {
    const player = await this.prisma.user.upsert({
      where: { studentCode: dto.studentCode },
      create: {
        firstName: dto.name?.split(' ')[0] || 'Jugador',
        lastName: dto.name?.split(' ')[1] || 'Registrado',
        email: `${dto.studentCode}@guest.foundteach.com`, // Dummy email for game-only registrations
        password: Math.random().toString(36).substring(2, 10),
        role: 'STUDENT',
        studentCode: dto.studentCode,
        totalScore: dto.totalScore,
        highestLevel: dto.highestLevel,
        lastLevel: dto.lastLevel,
        roundsPlayed: dto.roundsPlayed,
        levelsData: dto.levelsData ?? [],
      },
      update: {
        totalScore: dto.totalScore,
        highestLevel: dto.highestLevel,
        lastLevel: dto.lastLevel,
        roundsPlayed: dto.roundsPlayed,
        levelsData: dto.levelsData ?? [],
      },
    });

    return { success: true, player };
  }

  // ── Admin: list all players ─────────────────────────────────────────────────
  async findAll(search?: string) {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { studentCode: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.user.findMany({
      where: { ...where, studentCode: { not: null } },
      orderBy: [{ totalScore: 'desc' }, { highestLevel: 'desc' }],
    });
  }

  // ── Admin: get one ──────────────────────────────────────────────────────────
  async findOne(id: string) {
    const player = await this.prisma.user.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    return player;
  }

  // ── Admin: edit ─────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateGamePlayerAdminDto) {
    await this.findOne(id);
    // filter dto properly depending on what GamePlayerDto had
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  // ── Admin: delete ───────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { studentCode: null, totalScore: 0 } });
    return { success: true, message: 'Progreso de jugador eliminado' };
  }

  // ── Admin: summary stats ────────────────────────────────────────────────────
  async stats() {
    const [total, topPlayer, avgScore] = await Promise.all([
      this.prisma.user.count({ where: { studentCode: { not: null } } }),
      this.prisma.user.findFirst({ where: { studentCode: { not: null } }, orderBy: { totalScore: 'desc' } }),
      this.prisma.user.aggregate({ where: { studentCode: { not: null } }, _avg: { totalScore: true } }),
    ]);

    return {
      total,
      topPlayer,
      averageScore: Math.round(avgScore._avg.totalScore ?? 0),
    };
  }
}
