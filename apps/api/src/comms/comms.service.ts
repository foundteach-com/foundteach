import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, CreateMessageDto } from './dto/comms.dto';

@Injectable()
export class CommsService {
  constructor(private prisma: PrismaService) {}

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────

  findNotifications(unreadOnly?: boolean) {
    return this.prisma.notification.findMany({
      where: unreadOnly ? { isRead: false } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  createNotification(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: dto as never });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    return { success: true };
  }

  async deleteNotification(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  countUnread() {
    return this.prisma.notification.count({ where: { isRead: false } });
  }

  // ─── MESSAGES ─────────────────────────────────────────────────────────────

  findMessages(toEmail?: string) {
    return this.prisma.internalMessage.findMany({
      where: {
        ...(toEmail ? { toEmail } : {}),
        replyToId: null, // only top-level threads
      },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  createMessage(dto: CreateMessageDto) {
    return this.prisma.internalMessage.create({ data: dto as never });
  }

  markMessageRead(id: string) {
    return this.prisma.internalMessage.update({ where: { id }, data: { isRead: true } });
  }

  async deleteMessage(id: string) {
    await this.prisma.internalMessage.delete({ where: { id } });
    return { success: true };
  }

  countUnreadMessages() {
    return this.prisma.internalMessage.count({ where: { isRead: false } });
  }
}
