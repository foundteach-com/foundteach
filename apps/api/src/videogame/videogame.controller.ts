import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { VideogameService } from './videogame.service';

@Controller('videogame')
export class VideogameController {
  constructor(private readonly videogameService: VideogameService) {}

  @Get('sessions/:playerId')
  getPlayerSessions(@Param('playerId') playerId: string) {
    return this.videogameService.getPlayerSessions(playerId);
  }

  @Post('session')
  createSession(@Body() body: any) {
    return this.videogameService.createSession(body);
  }

  @Put('session/:id/end')
  endSession(@Param('id') id: string, @Body() body: { score: number; level: number; data?: any }) {
    return this.videogameService.endSession(id, body.score, body.level, body.data);
  }
}
