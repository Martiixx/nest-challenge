import { CreateProductDto } from '../../products/dto/create-product.dto';
import { ExternalProductItem } from '../dto/external-api-response.dto';

export class ExternalProductMapper {
  static toProduct(item: ExternalProductItem): CreateProductDto {
    const { fields, sys } = item;
    return {
      id: sys.id,
      sku: fields.sku,
      name: fields.name,
      brand: fields.brand,
      model: fields.model,
      category: fields.category || 'Uncategorized',
      color: fields.color,
      price: fields.price,
      currency: fields.currency,
      stock: fields.stock,
      metadata: sys,
      externalCreatedAt: sys.createdAt,
      externalUpdatedAt: sys.updatedAt,
    };
  }

  static toProducts(items: ExternalProductItem[]): Array<CreateProductDto> {
    return items.map((item) => this.toProduct(item));
  }
}
