import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { EmployeeType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() documentType?: string;
  @IsString() documentNumber: string;
  @IsString() position: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsEnum(EmployeeType) employeeType?: EmployeeType;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() documentType?: string;
  @IsOptional() @IsString() documentNumber?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsEnum(EmployeeType) employeeType?: EmployeeType;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}
