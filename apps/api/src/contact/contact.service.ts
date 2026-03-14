import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your smtp user
        pass: process.env.SMTP_PASS, // Your smtp pass
      },
    });
  }

  // Endpoint público — recibe mensajes del formulario del sitio web
  async create(dto: CreateContactDto) {
    const message = await this.prisma.contactMessage.create({
      data: dto,
    });

    try {
      if (process.env.SMTP_USER) {
        await this.transporter.sendMail({
          from: `"Notificaciones FoundTeach" <${process.env.SMTP_USER}>`,
          to: 'manuel.martinez@mannez.com',
          subject: `Nuevo mensaje de contacto: ${dto.subject}`,
          html: `
            <h2>Nuevo mensaje desde la página web</h2>
            <p><strong>Nombre:</strong> ${dto.name}</p>
            <p><strong>Email:</strong> ${dto.email}</p>
            <p><strong>Teléfono/WhatsApp:</strong> ${dto.phone || 'No especificado'}</p>
            <p><strong>Asunto:</strong> ${dto.subject}</p>
            <hr />
            <p><strong>Mensaje:</strong> <br />${dto.message}</p>
          `,
        });
      } else {
        console.warn(
          'SMTP_USER no está configurado, saltando el envío de correo.',
        );
      }
    } catch (error) {
      console.error('Error al enviar el correo de notificación:', error);
    }

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
