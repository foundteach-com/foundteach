import { IsString, IsUUID } from 'class-validator';

export class MakeDecisionDto {
  @IsUUID('4', { message: 'characterId debe ser un UUID válido' })
  characterId: string;

  @IsUUID('4', { message: 'decisionId debe ser un UUID válido' })
  decisionId: string;

  @IsUUID('4', { message: 'optionId debe ser un UUID válido' })
  optionId: string;
}
