import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactModule } from './contact/contact.module';
import { ServicesModule } from './services/services.module';
import { GamePlayersModule } from './game-players/game-players.module';
import { UploadModule } from './common/upload/upload.module';
import { HcmModule } from './hcm/hcm.module';
import { SdModule } from './sd/sd.module';
import { FiModule } from './fi/fi.module';
import { CompanyModule } from './company/company.module';
import { DocumentsModule } from './documents/documents.module';
import { FinanceModule } from './finance/finance.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContactModule,
    ServicesModule,
    GamePlayersModule,
    UploadModule,
    HcmModule,
    SdModule,
    FiModule,
    CompanyModule,
    DocumentsModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
