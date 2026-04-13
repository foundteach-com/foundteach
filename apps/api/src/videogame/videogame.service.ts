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

  // --- PLAYER PROGRESSION ---
  
  async getPlayerByCode(studentCode: string) {
    let player = await this.prisma.user.findUnique({
      where: { studentCode },
    });

    if (!player) {
      // Create guest player for demo if doesn't exist
      player = await this.prisma.user.create({
        data: {
          firstName: 'Estudiante',
          lastName: studentCode,
          email: `${studentCode}@guest.foundteach.com`, // needed for User
          password: Math.random().toString(36).substring(2, 10),
          role: 'STUDENT',
          studentCode,
          totalScore: 0,
          highestLevel: 1,
          roundsPlayed: 0,
        },
      });
    }

    return player;
  }

  async updateProgress(studentCode: string, newLevel: number, pointsToAdd: number) {
    const player = await this.getPlayerByCode(studentCode);

    return this.prisma.user.update({
      where: { studentCode },
      data: {
        totalScore: player.totalScore + pointsToAdd,
        highestLevel: Math.max(player.highestLevel, newLevel),
        lastLevel: newLevel,
        roundsPlayed: player.roundsPlayed + 1,
      },
    });
  }
}

