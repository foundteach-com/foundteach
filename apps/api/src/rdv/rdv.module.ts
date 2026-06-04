import { Module } from '@nestjs/common';
import { RdvPlayersController } from './controllers/rdv-players.controller';
import { RdvCharactersController } from './controllers/rdv-characters.controller';
import { RdvDecisionsController } from './controllers/rdv-decisions.controller';
import { RdvProgressController } from './controllers/rdv-progress.controller';
import { RdvPlayersService } from './services/rdv-players.service';
import { RdvCharactersService } from './services/rdv-characters.service';
import { RdvDecisionsService } from './services/rdv-decisions.service';
import { RdvProgressService } from './services/rdv-progress.service';

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
  ],
})
export class RdvModule {}
