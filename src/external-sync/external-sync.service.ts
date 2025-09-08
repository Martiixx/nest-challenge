import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from 'src/products/products.service';
import {
  ExternalApiResponse,
  ExternalProductItem,
} from './dto/external-api-response.dto';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExternalProductMapper } from './mapper/external-product.mapper';

@Injectable()
export class ExternalSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ExternalSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Application started - triggering initial sync...');
    setTimeout(async () => {
      try {
        await this.triggerSync();
      } catch (error) {
        this.logger.error('Initial sync failed:', error);
      }
    }, 2000);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncProducts() {
    this.logger.log('Starting product sync...');

    try {
      const products = await this.fetchAllProducts();
      const syncedCount = await this.syncProductsToDatabase(products);
      this.logger.log(`Succesfully synced ${syncedCount} products`);
    } catch (error) {
      this.logger.error('Failed to sync products', error);
    }
  }

  async fetchAllProducts(): Promise<ExternalProductItem[]> {
    const space_id = this.configService.get<string>('CONTENTFUL_SPACE_ID');
    const access_token = this.configService.get<string>(
      'CONTENTFUL_ACCESS_TOKEN',
    );
    const environment_id = this.configService.get<string>(
      'CONTENTFUL_ENVIRONMENT',
    );
    const content_type = this.configService.get<string>(
      'CONTENTFUL_CONTENT_TYPE',
    );
    const contentful_url = this.configService.get<string>('CONTENTFUL_URL');
    const uri = `/spaces/${space_id}/environments/${environment_id}/entries?access_token=${access_token}&content_type=${content_type}`;
    const full_url = contentful_url + uri;

    let allItems: ExternalProductItem[] = [];
    let skip = 0;
    const limit = 100;
    let processing = true;

    while (processing) {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          skip,
          limit,
        },
      };

      try {
        const response = await firstValueFrom(
          this.httpService.get<ExternalApiResponse>(full_url, config),
        );
        const { items, total } = response.data;
        allItems = [...allItems, ...items];

        skip += items.length;
        processing = skip < total;

        this.logger.debug(
          `Fetched ${items.length} items (${allItems.length}/${total})`,
        );
      } catch (error) {
        this.logger.error(`Failed to fetch products at skip = ${skip}`, error);
        throw error;
        break;
      }
    }
    return allItems;
  }

  async syncProductsToDatabase(products: ExternalProductItem[]) {
    const productsMapped = ExternalProductMapper.toProducts(products);
    const result = await this.productsService.createMany(productsMapped);
    this.logger.log(`Processed ${result.identifiers.length} products`);
    return result.identifiers.length;
  }

  async triggerSync() {
    this.logger.log('Manual sync triggered');
    await this.syncProducts();
    return { message: 'Sync completed' };
  }
}
