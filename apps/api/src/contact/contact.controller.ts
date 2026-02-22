import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role, ContactStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  // ── Endpoint PÚBLICO (formulario del sitio web) ───────────────────────
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  // ── Endpoints PROTEGIDOS (panel administrativo) ───────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query('status') status?: string) {
    const contactStatus =
      status && Object.values(ContactStatus).includes(status as ContactStatus)
        ? (status as ContactStatus)
        : undefined;
    return this.contactService.findAll(contactStatus);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
