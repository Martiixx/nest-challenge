import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    remove: jest.fn(),
    getDeletedProductsPercentage: jest.fn(),
    getNonDeletedProductsStats: jest.fn(),
    getLowStockProducts: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
      };
      mockProductsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 5 });
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productId = 'test-id';
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(service.remove).toHaveBeenCalledWith(productId);
    });
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return deleted products percentage', async () => {
      const mockStats = {
        percentage: 15.5,
        totalProducts: 100,
        deletedProducts: 15,
        activeProducts: 85,
        message: '15 out of 100 products are deleted (15.50%)',
      };
      mockProductsService.getDeletedProductsPercentage.mockResolvedValue(mockStats);

      const result = await controller.getDeletedProductsPercentage();

      expect(service.getDeletedProductsPercentage).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('getNonDeletedProductsStats', () => {
    it('should return non-deleted products stats', async () => {
      const mockStats = {
        percentage: 85.0,
        totalNonDeleted: 85,
        withPrice: 68,
        withoutPrice: 17,
        dateRange: { from: new Date(), to: new Date() },
        message: 'Test message',
      };
      mockProductsService.getNonDeletedProductsStats.mockResolvedValue(mockStats);

      const result = await controller.getNonDeletedProductsStats('2024-01-01', '2024-12-31');

      expect(service.getNonDeletedProductsStats).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return low stock products stats', async () => {
      const mockStats = {
        percentage: 15.5,
        count: 12,
        threshold: 10,
        totalActiveProducts: 85,
        message: '12 out of 85 active products have low stock (≤ 10 units) - 15.50%',
      };
      mockProductsService.getLowStockProducts.mockResolvedValue(mockStats);

      const result = await controller.getLowStockProducts('10');

      expect(service.getLowStockProducts).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockStats);
    });
  });
});
