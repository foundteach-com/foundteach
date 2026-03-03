import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  generateFileUrl(filename: string): string {
    const apiDomain =
      this.configService.get<string>('API_URL') || 'http://localhost:4000';
    return `${apiDomain}/uploads/${filename}`;
  }

  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de archivo no permitido (solo JPEG, PNG, WEBP, GIF)',
      );
    }

    // Máximo 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('El archivo supera el límite de 5MB');
    }

    return true;
  }
}
