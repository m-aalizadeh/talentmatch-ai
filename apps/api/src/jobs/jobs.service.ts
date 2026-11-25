import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { Prisma } from '../generated/prisma/client';
@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobDto, userId: string) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        company: dto.company,
        userId,
      },
    });
  }

  async findAll(query: QueryJobsDto) {
    const { page, limit, search, company, status, sortOrder } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.JobWhereInput = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          company: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (company) {
      where.company = {
        contains: company,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: sortOrder,
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      jobs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && page <= totalPages,
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found!');
    }
    return job;
  }

  async update(id: string, dto: UpdateJobDto, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id, userId } });
    if (!job) {
      throw new NotFoundException('Job not found!');
    }

    return this.prisma.job.update({
      where: { id },
      data: dto,
    });
  }

  async close(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id, userId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return this.prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }
}
