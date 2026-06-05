import { Module } from '@nestjs/common';
import { RdvPlayersController } from './controllers/rdv-players.controller';
import { RdvCharactersController } from './controllers/rdv-characters.controller';
import { RdvDecisionsController } from './controllers/rdv-decisions.controller';
import { RdvProgressController } from './controllers/rdv-progress.controller';
import { RdvPlayersService } from './services/rdv-players.service';
import { RdvCharactersService } from './services/rdv-characters.service';
import { RdvDecisionsService } from './services/rdv-decisions.service';
import { RdvProgressService } from './services/rdv-progress.service';
import { RdvSimulationEngineService } from './services/rdv-simulation-engine.service';
import { RdvDecisionEngineService } from './services/rdv-decision-engine.service';
import { RdvReportService } from './services/rdv-report.service';

@Module({
  controllers: [
    RdvPlayersController,
    RdvCharactersController,
    RdvDecisionsController,
    RdvProgressController,
  ],
  providers: [
    RdvPlayersService,
    RdvCharactersService,
    RdvDecisionsService,
    RdvProgressService,
    RdvSimulationEngineService,
    RdvDecisionEngineService,
    RdvReportService,
  ],
})
export class RdvModule {}
