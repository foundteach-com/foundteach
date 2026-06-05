import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RdvProgressService } from '../services/rdv-progress.service';
import { RdvReportService } from '../services/rdv-report.service';
import { MakeDecisionDto } from '../dto/make-decision.dto';

@Controller('rdv/progress')
export class RdvProgressController {
  constructor(
    private readonly progressService: RdvProgressService,
    private readonly reportService: RdvReportService,
  ) {}

  @Post('decide')
  async makeDecision(@Body() dto: MakeDecisionDto) {
    return this.progressService.makeDecision(dto);
  }

  @Post('advance')
  async advanceStage(@Body('characterId') characterId: string) {
    return this.progressService.advanceStage(characterId);
  }

  @Post('comprar-item')
  async buyItem(
    @Body('characterId') characterId: string,
    @Body('itemId') itemId: string,
  ) {
    return this.progressService.buyItem(characterId, itemId);
  }

  @Get('ligas')
  async getLeaderboard() {
    return this.progressService.getLeaderboard();
  }

  @Get(':characterId')
  async getHistory(@Param('characterId') characterId: string) {
    return this.progressService.getHistory(characterId);
  }

  @Get(':characterId/summary')
  async getSummary(@Param('characterId') characterId: string) {
    return this.progressService.getSummary(characterId);
  }

  @Get(':characterId/logros')
  async getLogros(@Param('characterId') characterId: string) {
    return this.progressService.getLogros(characterId);
  }

  @Get(':characterId/report')
  async getReport(@Param('characterId') characterId: string) {
    return this.reportService.generateLifeReport(characterId);
  }
}
