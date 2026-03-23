import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRepoDto {
  @IsString() name!: string;
  @IsString() @IsOptional() url?: string;          // GitHub/GitLab URL
  @IsString() @IsOptional() language?: string;      // TypeScript, Python…
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() defaultBranch?: string; // main, master
  @IsString() @IsOptional() projectId?: string;     // vinculado a Ops
  @IsBoolean() @IsOptional() isActive?: boolean;
}

export class UpdateRepoDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() url?: string;
  @IsString() @IsOptional() language?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() defaultBranch?: string;
  @IsString() @IsOptional() projectId?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
