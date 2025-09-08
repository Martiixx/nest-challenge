import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  limit: number = 5;

  @IsOptional()
  search?: string;

  @IsOptional()
  category?: string;
}

export class PaginatedResultDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}