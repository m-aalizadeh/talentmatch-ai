import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { ResumesModule } from './resumes/resumes.module';

@Module({
  imports: [PrismaModule, JobsModule, AuthModule, ResumesModule],
  controllers: [AppController],
})
export class AppModule {}
