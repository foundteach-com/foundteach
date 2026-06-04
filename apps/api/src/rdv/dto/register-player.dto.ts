import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterPlayerDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'El código estudiantil es obligatorio' })
  codigoEstudiantil: string;
}
