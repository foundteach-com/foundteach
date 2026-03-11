import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class UpsertGamePlayerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @IsInt()
  @Min(0)
  totalScore: number;

  @IsInt()
  @Min(1)
  highestLevel: number;

  @IsInt()
  @Min(1)
  lastLevel: number;

  @IsInt()
  @Min(0)
  roundsPlayed: number;

  @IsOptional()
  levelsData?: object;
}
