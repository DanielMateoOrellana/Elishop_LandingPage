import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File is required');
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            throw new BadRequestException('Only image files are allowed!');
        }

        const relativeUrl = await this.uploadsService.uploadFile(file, 'products');
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return { url: `${baseUrl}${relativeUrl}` };
    }

    @Public()
    @Get(':key')
    async getFile(@Param('key') key: string, @Res() res: Response) {
        const { stream, contentType } = await this.uploadsService.getFileStream(key);

        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
        });

        stream.pipe(res);
    }
}
