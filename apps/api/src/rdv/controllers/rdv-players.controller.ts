import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RdvPlayersService } from '../services/rdv-players.service';
import { RegisterPlayerDto } from '../dto/register-player.dto';

@Controller('rdv/players')
export class RdvPlayersController {
  constructor(private readonly playersService: RdvPlayersService) {}

  @Post('register')
  async register(@Body() dto: RegisterPlayerDto) {
    return this.playersService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body('identifier') identifier: string) {
    return this.playersService.login(identifier);
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.playersService.getProfile(id);
  }
}
