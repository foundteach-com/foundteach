import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateTimeEntryDto {
  @IsString() employeeId!: string;
  @IsDateString() date!: string;
  @IsNumber() hours!: number;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() projectId?: string;
}
