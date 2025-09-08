import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto, PaginatedResultDto } from './dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResultDto<Product>> {
    const { page, limit, search, name, category, minPrice, maxPrice } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (category) {
      queryBuilder.andWhere('product.category ILIKE :category', { category: `%${category}%` });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    queryBuilder
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

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
      .orUpdate(['name', 'price', 'brand', 'model', 'color', 'currency', 'stock', 'sku', 'metadata', 'externalCreatedAt', 'externalUpdatedAt'], ['id'])
      .returning('id')
      .execute();
  }
}