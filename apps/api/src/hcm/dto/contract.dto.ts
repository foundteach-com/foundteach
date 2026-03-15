import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ContractType, ContractStatus } from '@prisma/client';

export class CreateContractDto {
  @IsString() employeeId: string;
  @IsEnum(ContractType) contractType: ContractType;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsNumber() salary: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() workHoursPerWeek?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() documentUrl?: string;
}

export class UpdateContractDto {
  @IsOptional() @IsEnum(ContractType) contractType?: ContractType;
  @IsOptional() @IsEnum(ContractStatus) status?: ContractStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsNumber() salary?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() workHoursPerWeek?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() documentUrl?: string;
}
