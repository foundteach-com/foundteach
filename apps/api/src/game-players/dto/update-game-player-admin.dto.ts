import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateGamePlayerAdminDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  highestLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  lastLevel?: number;
}
