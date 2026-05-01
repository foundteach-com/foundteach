import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { MediaModule } from '../media/media.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MediaModule, PrismaModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
