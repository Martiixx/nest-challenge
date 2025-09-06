export interface ExternalApiResponse {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: ExternalProductItem[];
}

export interface ExternalProductItem {
  metadata?: {
    tags?: string[];
    concepts?: string[];
  };
  sys: ItemSys,
  fields: ExternalProductFields;
}

export interface ExternalProductFields {
  sku: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  color?: string;
  price: number;
  currency?: string;
  stock?: number;
}

interface ItemSys {
  space?: {
    sys: {
      type: string;
      linkType: string;
      id: string;
    };
  };
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  environment?: {
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
  };
  publishedVersion?: number;
  revision?: number;
  contentType?: {
    sys: {
      type: string;
      linkType: string;
      id: string;
    };
  };
  locale?: string;
}