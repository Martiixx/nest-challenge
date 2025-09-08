import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto, PaginatedResultDto } from './dto/pagination.dto';
import { NonDeletedProductsStatsDto } from './dto/non-deleted-product-stats.dto';
import { DeletedProductsStatsDto } from './dto/deleted-product-stats';
import { LowStockStatsDto } from './dto/low-stock-stats.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResultDto<Product>> {
    const { page, limit, name, category, minPrice, maxPrice } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.isActive = :isActive', { isActive: true });

    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (category) {
      queryBuilder.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.findOne(id);
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.update(id, { isActive: false });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async createMany(products: CreateProductDto[]) {
    return this.productRepository
      .createQueryBuilder()
      .insert()
      .into(Product)
      .values(products)
      .orUpdate(
        [
          'name',
          'price',
          'brand',
          'model',
          'color',
          'currency',
          'stock',
          'sku',
          'metadata',
          'externalCreatedAt',
          'externalUpdatedAt',
        ],
        ['id'],
      )
      .returning('id')
      .execute();
  }

  async getDeletedProductsPercentage(): Promise<DeletedProductsStatsDto> {
    const totalProducts = await this.productRepository.count();
    const deletedProducts = await this.productRepository.count({
      where: { isActive: false },
    });
    const activeProducts = totalProducts - deletedProducts;

    const percentage =
      totalProducts > 0 ? (deletedProducts / totalProducts) * 100 : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      totalProducts,
      deletedProducts,
      activeProducts,
      message: `${deletedProducts} out of ${totalProducts} products are deleted (${percentage.toFixed(2)}%)`,
    };
  }

  async getNonDeletedProductsStats(
    fromDate?: Date,
    toDate?: Date,
  ): Promise<NonDeletedProductsStatsDto> {
    const baseQuery = this.productRepository.createQueryBuilder('product');

    if (fromDate) {
      baseQuery.andWhere('product.externalCreatedAt >= :fromDate', {
        fromDate,
      });
    }
    if (toDate) {
      baseQuery.andWhere('product.externalCreatedAt <= :toDate', { toDate });
    }

    const totalProducts = await baseQuery.getCount();

    const nonDeletedQuery = baseQuery.clone();
    nonDeletedQuery.andWhere('product.isActive = :isActive', {
      isActive: true,
    });
    const totalNonDeleted = await nonDeletedQuery.getCount();

    const withPriceQuery = nonDeletedQuery.clone();
    withPriceQuery.andWhere('product.price IS NOT NULL AND product.price > 0');
    const withPrice = await withPriceQuery.getCount();

    const withoutPrice = totalNonDeleted - withPrice;

    const percentage =
      totalProducts > 0 ? (totalNonDeleted / totalProducts) * 100 : 0;

    const dateRange = {
      from: fromDate || new Date('1970-01-01'),
      to: toDate || new Date(),
    };

    return {
      percentage: Math.round(percentage * 100) / 100,
      totalNonDeleted,
      withPrice,
      withoutPrice,
      dateRange,
      message: `${totalNonDeleted} out of ${totalProducts} total products are non-deleted (${percentage.toFixed(2)}%) in the specified date range.`,
    };
  }

  async getLowStockProducts(threshold: number = 10): Promise<LowStockStatsDto> {
    const totalActiveProducts = await this.productRepository.count({
      where: { isActive: true },
    });

    const lowStockCount = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('(product.stock IS NOT NULL AND product.stock <= :threshold)', {
        threshold,
      })
      .getCount();

    const percentage =
      totalActiveProducts > 0 ? (lowStockCount / totalActiveProducts) * 100 : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      count: lowStockCount,
      threshold,
      totalActiveProducts,
      message: `${lowStockCount} out of ${totalActiveProducts} active products have low stock ${percentage.toFixed(2)}%`,
    };
  }
}
