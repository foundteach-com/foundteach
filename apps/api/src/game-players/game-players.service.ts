import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertGamePlayerDto } from './dto/upsert-game-player.dto';
import { UpdateGamePlayerAdminDto } from './dto/update-game-player-admin.dto';

@Injectable()
export class GamePlayersService {
  constructor(private prisma: PrismaService) {}

  // ── Public: game saves/updates player progress ──────────────────────────────
  async upsert(dto: UpsertGamePlayerDto) {
    const player = await this.prisma.gamePlayer.upsert({
      where: { studentCode: dto.studentCode },
      create: {
        name: dto.name,
        studentCode: dto.studentCode,
        totalScore: dto.totalScore,
        highestLevel: dto.highestLevel,
        lastLevel: dto.lastLevel,
        roundsPlayed: dto.roundsPlayed,
        levelsData: dto.levelsData ?? [],
      },
      update: {
        name: dto.name,
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
            { name: { contains: search, mode: 'insensitive' as const } },
            { studentCode: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.gamePlayer.findMany({
      where,
      orderBy: [{ totalScore: 'desc' }, { highestLevel: 'desc' }],
    });
  }

  // ── Admin: get one ──────────────────────────────────────────────────────────
  async findOne(id: string) {
    const player = await this.prisma.gamePlayer.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    return player;
  }

  // ── Admin: edit ─────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateGamePlayerAdminDto) {
    await this.findOne(id);
    return this.prisma.gamePlayer.update({ where: { id }, data: dto });
  }

  // ── Admin: delete ───────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.gamePlayer.delete({ where: { id } });
    return { success: true, message: 'Jugador eliminado' };
  }

  // ── Admin: summary stats ────────────────────────────────────────────────────
  async stats() {
    const [total, topPlayer, avgScore] = await Promise.all([
      this.prisma.gamePlayer.count(),
      this.prisma.gamePlayer.findFirst({ orderBy: { totalScore: 'desc' } }),
      this.prisma.gamePlayer.aggregate({ _avg: { totalScore: true } }),
    ]);

    return {
      total,
      topPlayer,
      averageScore: Math.round(avgScore._avg.totalScore ?? 0),
    };
  }
}
