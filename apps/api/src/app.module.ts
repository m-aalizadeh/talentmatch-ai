import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [PrismaModule, JobsModule],
  controllers: [AppController],
})
export class AppModule {}
