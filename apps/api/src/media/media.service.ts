import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const region = this.configService.get<string>('DO_SPACES_REGION') || 'nyc3';
    this.bucketName =
      this.configService.get<string>('DO_SPACES_BUCKET') || 'foundteach';
    const endpoint = `https://${region}.digitaloceanspaces.com`;

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY') || '',
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET') || '',
      },
    });
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
          ACL: 'public-read',
        }),
      );

      const region = this.configService.get<string>('DO_SPACES_REGION') || 'nyc3';
      const url = `https://${this.bucketName}.${region}.digitaloceanspaces.com/${fileName}`;

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
      this.logger.error(`Error uploading file to Spaces: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
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
      ACL: 'public-read',
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      const region = this.configService.get<string>('DO_SPACES_REGION') || 'nyc3';
      return {
        uploadUrl: url,
        fileUrl: `https://${this.bucketName}.${region}.digitaloceanspaces.com/${key}`,
        key,
      };
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
