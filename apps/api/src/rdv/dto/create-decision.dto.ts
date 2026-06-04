import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RdvLifeStage } from '@prisma/client';
import { CreateOptionDto } from './create-option.dto';

export class CreateDecisionDto {
  @IsEnum(RdvLifeStage, { message: 'La etapa debe ser un valor válido del ciclo vital' })
  etapa: RdvLifeStage;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  opciones?: CreateOptionDto[];
}
