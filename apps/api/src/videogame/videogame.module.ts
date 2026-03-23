import { Module } from '@nestjs/common';
import { VideogameService } from './videogame.service';
import { VideogameController } from './videogame.controller';

@Module({
  providers: [VideogameService],
  controllers: [VideogameController]
})
export class VideogameModule {}
