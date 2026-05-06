import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async findAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });
    if (!post) throw new NotFoundException('Artículo no encontrado');
    return post;
  }

  async create(data: any) {
    return this.prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : data.publishedAt,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No se recibió ningún archivo');
    }

    try {
      const { v4: uuidv4 } = await import('uuid');
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `blog/${uuidv4()}.${fileExtension}`;

      // Subimos directamente con uploadBuffer: no crea registros en GameAsset
      const url = await this.mediaService.uploadBuffer(
        file.buffer,
        fileName,
        file.mimetype,
      );

      return { url };
    } catch (error: any) {
      console.error('Error detallado en uploadImage:', error);
      throw new InternalServerErrorException(
        `Error en DigitalOcean Spaces: ${error.message || 'Error de conexión'}`,
      );
    }
  }
}
