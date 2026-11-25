import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Inject,
  ValidationPipe,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { QueryJobsDto } from './dto/query-jobs.dto';
interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}
@Controller('jobs')
export class JobsController {
  constructor(@Inject(JobsService) private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
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
    @Request() req: AuthenticatedRequest,
  ) {
    return this.jobsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    query: QueryJobsDto,
  ) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.jobsService.update(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/close')
  close(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.jobsService.close(id, req.user.userId);
  }
}
