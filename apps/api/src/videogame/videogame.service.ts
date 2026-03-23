import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VideogameService {
  constructor(private prisma: PrismaService) {}

  async createSession(data: Prisma.GameSessionUncheckedCreateInput) {
    return this.prisma.gameSession.create({ data });
  }

  async getSession(id: string) {
    return this.prisma.gameSession.findUnique({ where: { id } });
  }

  async endSession(id: string, score: number, level: number, data?: any) {
    return this.prisma.gameSession.update({
      where: { id },
      data: {
        score,
        level,
        data: data ? data : Prisma.DbNull,
        endedAt: new Date(),
      },
    });
  }

  async getPlayerSessions(playerId: string) {
    return this.prisma.gameSession.findMany({
      where: { playerId },
      orderBy: { startedAt: 'desc' },
    });
  }
}
