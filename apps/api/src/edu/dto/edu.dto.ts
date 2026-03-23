import { IsString, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateLessonDto {
  @IsString() courseId!: string;
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() contentUrl?: string;
  @IsInt() @IsOptional() durationMin?: number;
  @IsInt() @IsOptional() orderIndex?: number;
}

export class UpdateLessonDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() contentUrl?: string;
  @IsInt() @IsOptional() durationMin?: number;
  @IsInt() @IsOptional() orderIndex?: number;
}

export class CreateEnrollmentDto {
  @IsString() courseId!: string;
  @IsString() studentName!: string;
  @IsString() @IsOptional() studentEmail?: string;
}

export class UpdateEnrollmentDto {
  @IsInt() @IsOptional() progress?: number;
  @IsString() @IsOptional() status?: string;
}

export class CreateAssessmentDto {
  @IsString() courseId!: string;
  @IsString() @IsOptional() enrollmentId?: string;
  @IsString() title!: string;
  @IsString() @IsOptional() type?: string;
  @IsNumber() @IsOptional() maxScore?: number;
  @IsNumber() @IsOptional() score?: number;
  @IsString() @IsOptional() description?: string;
}

export class UpdateAssessmentDto {
  @IsNumber() @IsOptional() score?: number;
  @IsString() @IsOptional() description?: string;
}
