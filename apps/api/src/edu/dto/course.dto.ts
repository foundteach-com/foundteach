import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateCourseDto {
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() level?: string;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() coverUrl?: string;
  @IsNumber() @IsOptional() price?: number;
  @IsString() @IsOptional() instructor?: string;
  @IsString() @IsOptional() status?: string;
  @IsNumber() @IsOptional() durationH?: number;
  @IsBoolean() @IsOptional() isPublic?: boolean;
}

export class UpdateCourseDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() level?: string;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() coverUrl?: string;
  @IsNumber() @IsOptional() price?: number;
  @IsString() @IsOptional() instructor?: string;
  @IsString() @IsOptional() status?: string;
  @IsNumber() @IsOptional() durationH?: number;
  @IsBoolean() @IsOptional() isPublic?: boolean;
}
