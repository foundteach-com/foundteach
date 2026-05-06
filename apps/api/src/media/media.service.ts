import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectAclCommand,
  PutBucketPolicyCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.region = this.configService.get<string>('DO_SPACES_REGION') || 'nyc3';
    this.bucketName =
      this.configService.get<string>('DO_SPACES_BUCKET') || 'foundteach';
    const endpoint = `https://${this.region}.digitaloceanspaces.com`;

    this.s3Client = new S3Client({
      endpoint,
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY') || '',
        secretAccessKey:
          this.configService.get<string>('DO_SPACES_SECRET') || '',
      },
    });
  }

  /**
   * Al iniciar el módulo, aplica una Bucket Policy que garantiza acceso
   * público de lectura para todos los objetos del prefijo blog/.
   * Esto es necesario cuando el bucket tiene ACL por objeto desactivado.
   */
  async onModuleInit() {
    await this.ensurePublicBlogPolicy();
  }

  private async ensurePublicBlogPolicy() {
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadBlogImages',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/blog/*`,
        },
      ],
    });

    try {
      await this.s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: policy,
        }),
      );
      this.logger.log('✅ Política pública para blog/ aplicada en DO Spaces');
    } catch (err: any) {
      // Si la política falla, intentar via ACL por objeto en cada upload
      this.logger.warn(
        `⚠️ No se pudo aplicar Bucket Policy (${err.message}). Se usará ACL por objeto como alternativa.`,
      );
    }
  }

  /**
   * Intenta hacer un objeto públicamente legible.
   * Primero intenta ACL por objeto; si falla, lo registra sin bloquear.
   */
  private async tryMakePublic(key: string) {
    try {
      await this.s3Client.send(
        new PutObjectAclCommand({
          Bucket: this.bucketName,
          Key: key,
          ACL: 'public-read',
        }),
      );
    } catch {
      // ACL por objeto desactivado: la Bucket Policy cubre este caso
    }
  }

  /**
   * Construye la URL pública de un objeto en DO Spaces.
   */
  private publicUrl(key: string): string {
    return `https://${this.bucketName}.${this.region}.digitaloceanspaces.com/${key}`;
  }

  async uploadFile(file: Express.Multer.File, folder = 'videogame') {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      await this.tryMakePublic(fileName);

      const url = this.publicUrl(fileName);

      const asset = await this.prisma.gameAsset.create({
        data: {
          name: file.originalname,
          url,
          type: file.mimetype.split('/')[0].toUpperCase(),
          size: file.size,
        },
      });

      return asset;
    } catch (error) {
      this.logger.error(
        `Error uploading file to Spaces: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Sube un buffer directamente a DO Spaces y garantiza acceso público.
   * No crea registros en la base de datos.
   */
  async uploadBuffer(buffer: Buffer, fileName: string, mimetype: string) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      // Intentar hacer el objeto público (vía ACL o Bucket Policy lo cubre)
      await this.tryMakePublic(fileName);

      return this.publicUrl(fileName);
    } catch (error) {
      this.logger.error(
        `Error uploading buffer to Spaces: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Elimina un archivo de DO Spaces.
   */
  async deleteFile(key: string) {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.log(`🗑️ Archivo eliminado de Spaces: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting file from Spaces: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder = 'videogame',
  ) {
    const key = `${folder}/${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return {
        uploadUrl: url,
        fileUrl: this.publicUrl(key),
        key,
      };
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
