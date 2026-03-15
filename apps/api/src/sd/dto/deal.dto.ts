import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { PipelineStage } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  title: string;

  @IsString()
  customerId: string;

  @IsEnum(PipelineStage)
  @IsOptional()
  stage?: PipelineStage;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  expectedDate?: string;

  @IsNumber()
  @IsOptional()
  probability?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(PipelineStage)
  @IsOptional()
  stage?: PipelineStage;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsDateString()
  @IsOptional()
  expectedDate?: string;

  @IsDateString()
  @IsOptional()
  closedAt?: string;

  @IsNumber()
  @IsOptional()
  probability?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
