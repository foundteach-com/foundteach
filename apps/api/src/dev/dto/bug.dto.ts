import { IsString, IsOptional } from 'class-validator';

export class CreateBugDto {
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() severity?: string;   // LOW | MEDIUM | HIGH | CRITICAL
  @IsString() @IsOptional() status?: string;     // OPEN | IN_PROGRESS | FIXED | WONT_FIX | CLOSED
  @IsString() @IsOptional() assignee?: string;
  @IsString() repoId!: string;
  @IsString() @IsOptional() projectId?: string;
  @IsString() @IsOptional() stepsToReproduce?: string;
  @IsString() @IsOptional() labels?: string;     // comma-separated
}

export class UpdateBugDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() severity?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() assignee?: string;
  @IsString() @IsOptional() stepsToReproduce?: string;
  @IsString() @IsOptional() labels?: string;
}
