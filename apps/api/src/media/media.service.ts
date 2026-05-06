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
  /**
   * Carpeta raíz dentro del bucket que agrupa todos los archivos del proyecto.
   * Configurable con DO_SPACES_ROOT_FOLDER (por defecto: "foundteach-com").
   * Estructura: {bucket}/{rootFolder}/{servicio}/{archivo}
   * Ej: foundteach / foundteach-com / blog / uuid.jpg
   */
  private readonly rootFolder: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.region = this.configService.get<string>('DO_SPACES_REGION') || 'nyc3';
    this.bucketName =
      this.configService.get<string>('DO_SPACES_BUCKET') || 'foundteach';
    this.rootFolder =
      this.configService.get<string>('DO_SPACES_ROOT_FOLDER') || 'foundteach-com';

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
   * público de lectura para todos los objetos bajo foundteach-com/blog/*.
   */
  async onModuleInit() {
    await this.ensurePublicBlogPolicy();
  }

  private async ensurePublicBlogPolicy() {
    const blogPrefix = `${this.rootFolder}/blog/*`;
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadBlogImages',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/${blogPrefix}`,
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
      this.logger.log(
        `✅ Política pública para ${blogPrefix} aplicada en DO Spaces`,
      );
    } catch (err: any) {
      this.logger.warn(
        `⚠️ No se pudo aplicar Bucket Policy (${err.message}). Se usará ACL por objeto como alternativa.`,
      );
    }
  }

  /**
   * Construye la clave completa del objeto: {rootFolder}/{folder}/{uuid}.{ext}
   * Ej: foundteach-com/blog/3f8a...jpg
   */
  private buildKey(folder: string, originalName: string): string {
    const ext = originalName.split('.').pop();
    return `${this.rootFolder}/${folder}/${uuidv4()}.${ext}`;
  }

  /**
   * Construye la URL pública de un objeto en DO Spaces.
   */
  private publicUrl(key: string): string {
    return `https://${this.bucketName}.${this.region}.digitaloceanspaces.com/${key}`;
  }

  /**
   * Intenta hacer un objeto públicamente legible vía ACL.
   * Si el bucket tiene ACL desactivado, falla silenciosamente
   * (la Bucket Policy del onModuleInit lo cubre).
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
   * Sube un archivo Express.Multer.File a DO Spaces y crea un registro en GameAsset.
   * Carpeta destino: {rootFolder}/{folder}/
   */
  async uploadFile(file: Express.Multer.File, folder = 'app') {
    const key = this.buildKey(folder, file.originalname);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      await this.tryMakePublic(key);

      const url = this.publicUrl(key);

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
   * Sube un buffer directamente a DO Spaces sin crear registro en la DB.
   * El parámetro fileName debe incluir la subcarpeta de servicio (ej: "blog/uuid.jpg")
   * — el rootFolder se antepone automáticamente.
   */
  async uploadBuffer(buffer: Buffer, fileName: string, mimetype: string) {
    // Si el fileName ya incluye el rootFolder, lo usamos tal cual.
    // Si no, lo prefijamos para mantener la estructura.
    const key = fileName.startsWith(this.rootFolder)
      ? fileName
      : `${this.rootFolder}/${fileName}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      await this.tryMakePublic(key);

      return this.publicUrl(key);
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
    folder = 'app',
  ) {
    const key = this.buildKey(folder, fileName);
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
