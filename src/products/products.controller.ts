import { Controller, Get, Query, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PaginationDto, PaginatedResultDto } from './dto/pagination.dto';
import { Product } from '../entities/product.entity';
import { DeletedProductsStatsDto } from './dto/deleted-product-stats';
import { NonDeletedProductsStatsDto } from './dto/non-deleted-product-stats.dto';
import { LowStockStatsDto } from './dto/low-stock-stats.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResultDto<Product>> {
    const limitedPaginationDto = {
      ...paginationDto,
      limit: 5
    };
    return this.productsService.findAll(limitedPaginationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Get('analytics/deleted-percentage')
  async getDeletedProductsPercentage(): Promise<DeletedProductsStatsDto> {
    return this.productsService.getDeletedProductsPercentage();
  }

  @Get('analytics/non-deleted-stats')
  async getNonDeletedProductsStats(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ): Promise<NonDeletedProductsStatsDto> {
    const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
    const parsedToDate = toDate ? new Date(toDate) : undefined;
    
    return this.productsService.getNonDeletedProductsStats(parsedFromDate, parsedToDate);
  }

  @Get('analytics/low-stock')
  async getLowStockProducts(
    @Query('threshold') threshold?: string
  ): Promise<LowStockStatsDto> {
    const parsedThreshold = threshold ? parseInt(threshold, 10) : 10;
    
    return this.productsService.getLowStockProducts(parsedThreshold);
  }
}
