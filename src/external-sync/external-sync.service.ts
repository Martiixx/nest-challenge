import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from 'src/products/products.service';
import { ExternalApiResponse, ExternalProductItem } from './dto/external-api-response.dto';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalSyncService {
  private readonly logger = new Logger(ExternalSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {}

  async fetchProducts(): Promise<ExternalProductItem[]> {
    const space_id = this.configService.get<string>('CONTENTFUL_SPACE_ID');
    const access_token = this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN');
    const environment = this.configService.get<string>('CONTENTFUL_ENVIRONMENT');
    const content_type = this.configService.get<string>('CONTENTFUL_CONTENT_TYPE');
    const url = `https://cdn.contentful.com/spaces/${space_id}/environments/${environment_id}/entries?access_token=${access_token}&content_type=${content_type}`;

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    try {
      const response = await firstValueFrom(
        this.httpService.get<ExternalApiResponse>(url, config)
      );
      return response.data.items;
    } catch (error) {
      this.logger.error('Failed to fetch products', error);
      throw error;
    }
  }

}
