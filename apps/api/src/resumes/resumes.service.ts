import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { relative } from 'node:path';
import { unlink } from 'node:fs/promises';
import { validateResumeFile } from './utils/file-validator';

@Injectable()
export class ResumesService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('File is Required!');
    }
    const detectedMimeType = await validateResumeFile(file.path);
    try {
      const resume = await this.prisma.resume.create({
        data: {
          fileName: file.originalname,
          fileUrl: relative(process.cwd(), file.path),
          mimeType: detectedMimeType,
          fileSize: file.size,
          userId,
        },
      });
      return {
        message: 'Resume uploaded successfully!',
        resume,
      };
    } catch (error) {
      await unlink(file.path).catch(() => undefined);

      throw error;
    }
  }
}
