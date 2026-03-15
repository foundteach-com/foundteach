import { Module } from '@nestjs/common';
import { SdService } from './sd.service';
import { SdController } from './sd.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SdController],
  providers: [SdService],
  exports: [SdService],
})
export class SdModule {}
