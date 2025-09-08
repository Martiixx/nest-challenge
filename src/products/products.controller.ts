import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { PaginationDto, PaginatedResultDto } from './dto/pagination.dto';
import { Product } from '../entities/product.entity';
import { DeletedProductsStatsDto } from './dto/deleted-product-stats';
import { NonDeletedProductsStatsDto } from './dto/non-deleted-product-stats.dto';
import { LowStockStatsDto } from './dto/low-stock-stats.dto';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedResultDto<Product>,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 5)',
    example: 5,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by product name',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResultDto<Product>> {
    const limitedPaginationDto = {
      ...paginationDto,
      limit: 5,
    };
    return this.productsService.findAll(limitedPaginationDto);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 'uuid-string' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Get('analytics/deleted-percentage')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get percentage of deleted products' })
  @ApiResponse({
    status: 200,
    description: 'Deleted products statistics',
    schema: {
      type: 'object',
      properties: {
        percentage: { type: 'number', example: 15.5 },
        totalProducts: { type: 'number', example: 100 },
        deletedProducts: { type: 'number', example: 15 },
        activeProducts: { type: 'number', example: 85 },
        message: {
          type: 'string',
          example: '15 out of 100 products are deleted (15.50%)',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeletedProductsPercentage(): Promise<DeletedProductsStatsDto> {
    return this.productsService.getDeletedProductsPercentage();
  }

  @Get('analytics/non-deleted-stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get statistics of non-deleted products with optional date range',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Start date (ISO format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'End date (ISO format)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Non-deleted products statistics',
    schema: {
      type: 'object',
      properties: {
        percentage: { type: 'number', example: 85.0 },
        totalNonDeleted: { type: 'number', example: 85 },
        withPrice: { type: 'number', example: 68 },
        withoutPrice: { type: 'number', example: 17 },
        dateRange: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            to: {
              type: 'string',
              format: 'date-time',
              example: '2024-12-31T00:00:00.000Z',
            },
          },
        },
        message: {
          type: 'string',
          example:
            '85 out of 100 total products are non-deleted (85.00%) in the specified date range.',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNonDeletedProductsStats(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<NonDeletedProductsStatsDto> {
    const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
    const parsedToDate = toDate ? new Date(toDate) : undefined;

    return this.productsService.getNonDeletedProductsStats(
      parsedFromDate,
      parsedToDate,
    );
  }

  @Get('analytics/low-stock')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get low stock products statistics' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    description: 'Stock threshold (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock statistics',
    schema: {
      type: 'object',
      properties: {
        percentage: { type: 'number', example: 15.5 },
        count: { type: 'number', example: 12 },
        threshold: { type: 'number', example: 10 },
        totalActiveProducts: { type: 'number', example: 85 },
        message: {
          type: 'string',
          example:
            '12 out of 85 active products have low stock (≤ 10 units) - 15.50%',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLowStockProducts(
    @Query('threshold') threshold?: string,
  ): Promise<LowStockStatsDto> {
    const parsedThreshold = threshold ? parseInt(threshold, 10) : 10;

    return this.productsService.getLowStockProducts(parsedThreshold);
  }
}
