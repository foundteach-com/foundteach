import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../common/upload/upload.service';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async findAll(category?: string) {
    return this.prisma.document.findMany({
      where: category ? { category } : undefined,
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async create(file: Express.Multer.File, name: string, category?: string) {
    const url = this.uploadService.generateFileUrl(`docs/${file.filename}`);
    return this.prisma.document.create({
      data: {
        name: name || file.originalname,
        filename: file.filename,
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

    // Eliminar archivo del disco
    try {
      const filePath = join(process.cwd(), 'uploads', 'docs', doc.filename);
      await unlink(filePath);
    } catch {
      // Si ya no existe en disco, continuar igual
    }

    return this.prisma.document.delete({ where: { id } });
  }
}
