import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Inject,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(@Inject(JobsService) private readonly jobsService: JobsService) {}

  @Post()
  create(
    @Body(
      new ValidationPipe({
        expectedType: CreateJobDto,
        whitelist: true,
        transform: true,
      }),
    )
    dto: CreateJobDto,
  ) {
    return this.jobsService.create(dto);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.jobsService.close(id);
  }
}
