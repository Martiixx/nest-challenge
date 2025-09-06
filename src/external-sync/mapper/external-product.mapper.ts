import { ExternalProductItem } from "../dto/external-api-response.dto";

export class ExternalProductMapper {
  static toProduct(item: ExternalProductItem): CreateProductDto {
    const { fields } = item;
    return {
      sku: fields.sku,
      name: fields.name,
      brand: fields.brand,
      model: fields.model,
      category: fields.category || 'Uncategorized',
      color: fields.color,
      price: fields.price,
      currency: fields.currency,
      stock: fields.stock
    }
  }

  static toProducts(items: ExternalProductItem[]): Array<CreateProductDto> {
    return items.map(item => this.toProduct(item));
  }
}