import { Module } from '@nestjs/common';
import { FiService } from './fi.service';
import { FiController } from './fi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FiController],
  providers: [FiService],
  exports: [FiService],
})
export class FiModule {}
