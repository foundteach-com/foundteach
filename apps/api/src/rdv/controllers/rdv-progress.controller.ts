import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RdvProgressService } from '../services/rdv-progress.service';
import { MakeDecisionDto } from '../dto/make-decision.dto';

@Controller('rdv/progress')
export class RdvProgressController {
  constructor(private readonly progressService: RdvProgressService) {}

  @Post('decide')
  async makeDecision(@Body() dto: MakeDecisionDto) {
    return this.progressService.makeDecision(dto);
  }

  @Get(':characterId')
  async getHistory(@Param('characterId') characterId: string) {
    return this.progressService.getHistory(characterId);
  }

  @Get(':characterId/summary')
  async getSummary(@Param('characterId') characterId: string) {
    return this.progressService.getSummary(characterId);
  }
}
