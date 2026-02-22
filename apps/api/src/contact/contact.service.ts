import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  // Endpoint público — recibe mensajes del formulario del sitio web
  async create(dto: CreateContactDto) {
    const message = await this.prisma.contactMessage.create({
      data: dto,
    });

    return {
      success: true,
      message:
        'Mensaje recibido correctamente. Nos pondremos en contacto pronto.',
      id: message.id,
    };
  }

  // Endpoints protegidos — panel administrativo
  async findAll(status?: ContactStatus) {
    const where = status ? { status } : {};

    return this.prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    return message;
  }

  async update(id: string, dto: UpdateContactDto) {
    await this.findOne(id);

    return this.prisma.contactMessage.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.contactMessage.delete({
      where: { id },
    });

    return { success: true, message: 'Mensaje eliminado' };
  }
}
