import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyService, UpdateCompanyDto } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  // Público — útil para el sitio web y el panel
  @Get()
  getConfig() {
    return this.companyService.getConfig();
  }

  // Protegido — solo ADMIN puede editar
  @Patch()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateConfig(@Body() dto: UpdateCompanyDto) {
    return this.companyService.updateConfig(dto);
  }
}
