import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDeploymentDto {
  @IsString() version!: string;           // ej: v1.2.0 o commit sha
  @IsString() @IsOptional() environment?: string; // DEV | STAGING | PROD
  @IsString() @IsOptional() status?: string;      // SUCCESS | FAILED | IN_PROGRESS | ROLLED_BACK
  @IsString() repoId!: string;
  @IsString() @IsOptional() notes?: string;
  @IsDateString() @IsOptional() deployedAt?: string;
  @IsString() @IsOptional() deployedBy?: string;
}

export class UpdateDeploymentDto {
  @IsString() @IsOptional() version?: string;
  @IsString() @IsOptional() environment?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() deployedBy?: string;
}
