import {
  IsString,
  IsOptional,
  IsObject,
  IsInt,
  Min,
} from 'class-validator';

export class CreateOptionDto {
  @IsString()
  texto: string;

  @IsOptional()
  @IsObject()
  cambiosEnAtributos?: Record<string, number>; // { fisico: 5, cognitivo: -3 }

  @IsOptional()
  @IsObject()
  cambiosEnContexto?: Record<string, number>; // { familia: 10, escuela: -5 }

  @IsOptional()
  @IsObject()
  cambiosEnRelaciones?: Record<string, number>; // { MADRE: 5, PADRE: -3 }

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
