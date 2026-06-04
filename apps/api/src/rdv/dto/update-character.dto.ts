import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { RdvGender, RdvLifeStage } from '@prisma/client';

export class UpdateCharacterDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsEnum(RdvGender)
  genero?: RdvGender;

  @IsOptional()
  @IsEnum(RdvLifeStage)
  etapaActual?: RdvLifeStage;
}
