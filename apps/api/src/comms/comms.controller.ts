import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommsService } from './comms.service';
import { CreateNotificationDto, CreateMessageDto } from './dto/comms.dto';

@Controller('comms')
@UseGuards(AuthGuard('jwt'))
export class CommsController {
  constructor(private comms: CommsService) {}

  @Get('notifications') getNotifications(@Query('unread') unread?: string) {
    return this.comms.findNotifications(unread === 'true');
  }
  @Get('notifications/unread-count') countUnread() { return this.comms.countUnread(); }
  @Post('notifications') createNotification(@Body() dto: CreateNotificationDto) { return this.comms.createNotification(dto); }
  @Put('notifications/read-all') markAllRead() { return this.comms.markAllRead(); }
  @Put('notifications/:id/read') markRead(@Param('id') id: string) { return this.comms.markRead(id); }
  @Delete('notifications/:id') deleteNotification(@Param('id') id: string) { return this.comms.deleteNotification(id); }

  @Get('messages') getMessages(@Query('toEmail') toEmail?: string) { return this.comms.findMessages(toEmail); }
  @Get('messages/unread-count') countUnreadMessages() { return this.comms.countUnreadMessages(); }
  @Post('messages') createMessage(@Body() dto: CreateMessageDto) { return this.comms.createMessage(dto); }
  @Put('messages/:id/read') markMessageRead(@Param('id') id: string) { return this.comms.markMessageRead(id); }
  @Delete('messages/:id') deleteMessage(@Param('id') id: string) { return this.comms.deleteMessage(id); }
}
