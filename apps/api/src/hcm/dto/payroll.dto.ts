import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PayrollStatus } from '@prisma/client';

export class CreatePayrollDto {
  @IsString() employeeId: string;
  @IsString() period: string; // "2026-03"
  @IsNumber() baseSalary: number;
  @IsOptional() @IsNumber() bonuses?: number;
  @IsOptional() @IsNumber() deductions?: number;
  @IsNumber() netPay: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdatePayrollDto {
  @IsOptional() @IsEnum(PayrollStatus) status?: PayrollStatus;
  @IsOptional() @IsNumber() bonuses?: number;
  @IsOptional() @IsNumber() deductions?: number;
  @IsOptional() @IsNumber() netPay?: number;
  @IsOptional() @IsDateString() paidAt?: string;
  @IsOptional() @IsString() notes?: string;
}
