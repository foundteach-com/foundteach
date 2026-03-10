import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from './upload.service';
import { existsSync, mkdirSync } from 'fs';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          
          try {
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath, { recursive: true });
              this.logger.log(`📁 Directorio de uploads creado en: ${uploadPath}`);
            }
            cb(null, uploadPath);
          } catch (error) {
            this.logger.error('❌ Error creando directorio de uploads', error);
            cb(error as Error, uploadPath);
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      this.logger.error('❌ Fallo en la subida de archivo: No se recibió ningún archivo');
      throw new BadRequestException('El archivo no se pudo subir correctamente');
    }

    this.logger.log(`✅ Imagen subida con éxito: ${file.filename} (${file.size} bytes)`);
    const fileUrl = this.uploadService.generateFileUrl(file.filename);

    return {
      success: true,
      filename: file.filename,
      url: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
