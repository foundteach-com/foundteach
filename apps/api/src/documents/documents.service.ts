import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { extname } from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async findAll(category?: string) {
    return this.prisma.document.findMany({
      where: category ? { category } : undefined,
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async create(file: Express.Multer.File, name: string, category?: string) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `docs/${unique}${extname(file.originalname)}`;
    
    // Subir a DigitalOcean
    const url = await this.mediaService.uploadBuffer(
      file.buffer,
      filename,
      file.mimetype,
    );

    return this.prisma.document.create({
      data: {
        name: name || file.originalname,
        filename: filename, // Guardamos el KEY de S3 aquí
        url,
        mimetype: file.mimetype,
        size: file.size,
        category: category || null,
      },
    });
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    // Eliminar archivo de DigitalOcean
    await this.mediaService.deleteFile(doc.filename);

    return this.prisma.document.delete({ where: { id } });
  }
}
