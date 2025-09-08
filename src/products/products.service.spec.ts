import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    clone: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orUpdate: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [{ id: '1', name: 'Test Product' }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.findAll({ page: 1, limit: 5 });

      expect(result).toEqual({
        data: mockProducts,
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const mockProduct = { id: '1', name: 'Updated Product' };
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('1', { name: 'Updated Product' });

      expect(repository.update).toHaveBeenCalledWith('1', { name: 'Updated Product' });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(repository.update).toHaveBeenCalledWith('1', { isActive: false });
    });
  });

  describe('createMany', () => {
    it('should create multiple products', async () => {
      const mockProducts = [{
        id: '1',
        sku: 'SKU1',
        name: 'Product 1',
        brand: 'Brand',
        model: 'Model',
        category: 'Category',
        color: 'Color',
        price: 100,
        currency: 'USD',
        stock: 10,
        metadata: {},
        externalCreatedAt: new Date(),
        externalUpdatedAt: new Date(),
      }];
      mockQueryBuilder.execute.mockResolvedValue({ identifiers: [{ id: '1' }] });

      const result = await service.createMany(mockProducts);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({ identifiers: [{ id: '1' }] });
    });
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return deleted products statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(15);

      const result = await service.getDeletedProductsPercentage();

      expect(result).toEqual({
        percentage: 15,
        totalProducts: 100,
        deletedProducts: 15,
        activeProducts: 85,
        message: '15 out of 100 products are deleted (15.00%)',
      });
    });
  });

  describe('getNonDeletedProductsStats', () => {
    it('should return non-deleted products statistics', async () => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85) 
        .mockResolvedValueOnce(68); 

      const result = await service.getNonDeletedProductsStats();

      expect(result.percentage).toBe(85);
      expect(result.totalNonDeleted).toBe(85);
      expect(result.withPrice).toBe(68);
      expect(result.withoutPrice).toBe(17);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return low stock products statistics', async () => {
      mockRepository.count.mockResolvedValue(85);
      mockQueryBuilder.getCount.mockResolvedValue(12);

      const result = await service.getLowStockProducts(10);

      expect(result).toEqual({
        percentage: 14.12,
        count: 12,
        threshold: 10,
        totalActiveProducts: 85,
        message: '12 out of 85 active products have low stock 14.12%',
      });
    });
  });
});
