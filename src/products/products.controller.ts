import { Controller, Get, Query, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PaginationDto, PaginatedResultDto } from './dto/pagination.dto';
import { Product } from '../entities/product.entity';

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
}
