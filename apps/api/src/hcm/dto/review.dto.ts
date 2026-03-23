import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString() employeeId!: string;
  @IsString() period!: string;       // "2026-Q1"
  @IsInt() @Min(1) @Max(5) score!: number;
  @IsString() @IsOptional() strengths?: string;
  @IsString() @IsOptional() improvements?: string;
  @IsString() @IsOptional() reviewerName?: string;
}

export class UpdateReviewDto {
  @IsInt() @Min(1) @Max(5) @IsOptional() score?: number;
  @IsString() @IsOptional() strengths?: string;
  @IsString() @IsOptional() improvements?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() reviewerName?: string;
}

export class CreateSkillDto {
  @IsString() employeeId!: string;
  @IsString() name!: string;
  @IsString() @IsOptional() level?: string;   // BASIC | INTERMEDIATE | ADVANCED | EXPERT
  @IsString() @IsOptional() category?: string;
}
