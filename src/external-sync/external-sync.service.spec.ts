import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSyncService } from './external-sync.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { of } from 'rxjs';

describe('ExternalSyncService', () => {
  let service: ExternalSyncService;
  let httpService: HttpService;
  let configService: ConfigService;
  let productsService: ProductsService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockProductsService = {
    createMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalSyncService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<ExternalSyncService>(ExternalSyncService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    productsService = module.get<ProductsService>(ProductsService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        CONTENTFUL_SPACE_ID: 'test-space',
        CONTENTFUL_ACCESS_TOKEN: 'test-token',
        CONTENTFUL_ENVIRONMENT: 'test-env',
        CONTENTFUL_CONTENT_TYPE: 'product',
        CONTENTFUL_URL: 'https://api.contentful.com',
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncProducts', () => {
    it('should sync products successfully', async () => {
      const mockProducts = [{
        sys: { id: '1', type: 'Entry', createdAt: new Date(), updatedAt: new Date() },
        fields: { sku: 'SKU1', name: 'Product 1', brand: 'Brand', model: 'Model', category: 'Category', color: 'Red', price: 100, currency: 'USD', stock: 10 }
      }];
      
      jest.spyOn(service, 'fetchAllProducts').mockResolvedValue(mockProducts);
      jest.spyOn(service, 'syncProductsToDatabase').mockResolvedValue(1);

      await service.syncProducts();

      expect(service.fetchAllProducts).toHaveBeenCalled();
      expect(service.syncProductsToDatabase).toHaveBeenCalledWith(mockProducts);
    });
  });

  describe('fetchAllProducts', () => {
    it('should fetch all products from external API', async () => {
      const mockResponse = {
        data: {
          items: [{
            sys: { id: '1', type: 'Entry', createdAt: new Date(), updatedAt: new Date() },
            fields: { sku: 'SKU1', name: 'Product 1', brand: 'Brand', model: 'Model', category: 'Category', color: 'Red', price: 100, currency: 'USD', stock: 10 }
          }],
          total: 1
        }
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchAllProducts();

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data.items);
    });
  });

  describe('syncProductsToDatabase', () => {
    it('should sync products to database', async () => {
      const mockProducts = [{
        sys: { id: '1', type: 'Entry', createdAt: new Date(), updatedAt: new Date() },
        fields: { sku: 'SKU1', name: 'Product 1', brand: 'Brand', model: 'Model', category: 'Category', color: 'Red', price: 100, currency: 'USD', stock: 10 }
      }];
      
      mockProductsService.createMany.mockResolvedValue({ identifiers: [{ id: '1' }] });

      const result = await service.syncProductsToDatabase(mockProducts);

      expect(productsService.createMany).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('triggerSync', () => {
    it('should trigger manual sync', async () => {
      jest.spyOn(service, 'syncProducts').mockResolvedValue(undefined);

      const result = await service.triggerSync();

      expect(service.syncProducts).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Sync completed' });
    });
  });
});
