import { IsString, IsEnum, MinLength } from 'class-validator';
import { RdvGender } from '@prisma/client';

export class CreateCharacterDto {
  @IsString()
  @MinLength(2, { message: 'El nombre del personaje debe tener al menos 2 caracteres' })
  nombre: string;

  @IsEnum(RdvGender, { message: 'El género debe ser MALE o FEMALE' })
  genero: RdvGender;

  @IsString()
  userId: string;
}
