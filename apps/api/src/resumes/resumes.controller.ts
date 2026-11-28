import {
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { ResumesService } from './resumes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadPath = resolve(process.cwd(), 'storage', 'resumes');
          mkdir(uploadPath, { recursive: true })
            .then(() => callback(null, uploadPath))
            .catch((error: Error) => callback(error, uploadPath));
        },
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        const allowedTypes = [
          {
            extension: '.pdf',
            mimeType: 'application/pdf',
          },
          {
            extension: '.docx',
            mimeType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        ];
        const isAllowed = allowedTypes.some(
          (type) =>
            type.extension === extension && type.mimeType === file.mimetype,
        );
        if (!isAllowed) {
          return callback(
            new BadRequestException('Only PDF and DOCX files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadResume(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.resumesService.upload(file, req.user.userId);
  }
}
