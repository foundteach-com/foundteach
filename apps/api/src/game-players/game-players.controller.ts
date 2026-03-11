import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { GamePlayersService } from './game-players.service';
import { UpsertGamePlayerDto } from './dto/upsert-game-player.dto';
import { UpdateGamePlayerAdminDto } from './dto/update-game-player-admin.dto';

@Controller('game-players')
export class GamePlayersController {
  constructor(private readonly gamePlayersService: GamePlayersService) {}

  // ── PUBLIC: the game app calls this after each level ──────────────────────
  @Post()
  upsert(@Body() dto: UpsertGamePlayerDto) {
    return this.gamePlayersService.upsert(dto);
  }

  // ── ADMIN protected endpoints ──────────────────────────────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query('search') search?: string) {
    return this.gamePlayersService.findAll(search);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  stats() {
    return this.gamePlayersService.stats();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.gamePlayersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateGamePlayerAdminDto) {
    return this.gamePlayersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.gamePlayersService.remove(id);
  }
}
