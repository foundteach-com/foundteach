import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() rut?: string;
  @IsOptional() @IsString() legalRepresentativeName?: string;
  @IsOptional() @IsString() legalRepresentativeId?: string;
  @IsOptional() @IsString() certificateOfExistenceNumber?: string;
  @IsOptional() @IsString() certificateExpeditedDate?: string;
  @IsOptional() @IsString() incorporationDate?: string;
  @IsOptional() @IsString() statutesDescription?: string;
}

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    // Busca el único registro; si no existe, lo crea con valores por defecto
    const configs = await this.prisma.companyConfig.findMany({ take: 1 });
    if (configs.length > 0) return configs[0];

    return this.prisma.companyConfig.create({
      data: { name: 'FoundTeach EdTech S.A.S' },
    });
  }

  async updateConfig(dto: UpdateCompanyDto) {
    const config = await this.getConfig();
    return this.prisma.companyConfig.update({
      where: { id: config.id },
      data: dto,
    });
  }
}
