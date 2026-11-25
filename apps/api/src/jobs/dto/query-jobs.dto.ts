import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsString,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus } from '../../generated/prisma/enums';

export class QueryJobsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @IsOptional()
  @IsIn(Object.values(JobStatus))
  status?: JobStatus;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
