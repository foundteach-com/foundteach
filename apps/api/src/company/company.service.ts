import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateCompanyDto {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
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
