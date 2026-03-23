import { Module } from '@nestjs/common';
import { EduController } from './edu.controller';
import { EduService } from './edu.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EduController],
  providers: [EduService],
})
export class EduModule {}
