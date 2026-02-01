import { Injectable, OnModuleInit, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Readable } from 'stream';

@Injectable()
export class UploadsService implements OnModuleInit {
    private readonly logger = new Logger(UploadsService.name);
    private s3Client: S3Client;
    private bucketName: string;

    onModuleInit() {
        const accountId = (process.env.R2_ACCOUNT_ID || '').trim();
        const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
        const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
        const bucketName = (process.env.R2_BUCKET_NAME || '').trim();

        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
            this.logger.error('⚠️ R2 credentials not fully configured.');
            return;
        }

        this.bucketName = bucketName;
        const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
        });

        this.logger.log(`✅ R2 client (Proxy Mode) initialized for bucket: ${bucketName}`);
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
        if (!this.s3Client) throw new InternalServerErrorException('R2 Client not initialized');

        try {
            const fileExt = extname(file.originalname);
            // Usamos una estructura simple: folder_uuid.ext
            const key = `${folder}_${randomUUID()}${fileExt}`;

            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));

            this.logger.log(`Uploaded to R2: ${key}`);

            // Retornamos URL relativa al backend (Proxy)
            // El frontend usará: http://localhost:3000/api/uploads/{key}
            // Asumiendo que el backend corre allí. O devolvemos solo la Key?
            // Devolveremos la ruta relativa completa para que sea fácil
            return `/api/uploads/${key}`;

        } catch (error) {
            this.logger.error('Error uploading to R2:', error);
            throw new InternalServerErrorException('Upload failed');
        }
    }

    async getFileStream(key: string): Promise<{ stream: Readable, contentType: string }> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            this.logger.log(`📥 Read from R2: ${key} | Type: ${response.ContentType} | Size: ${response.ContentLength}`);

            return {
                stream: response.Body as Readable,
                contentType: response.ContentType || 'application/octet-stream',
            };
        } catch (error) {
            this.logger.error(`Error fetching file ${key}:`, error);
            throw new NotFoundException('File not found');
        }
    }
}
