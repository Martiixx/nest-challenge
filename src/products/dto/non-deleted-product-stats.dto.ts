
export interface NonDeletedProductsStatsDto {
  percentage: number;
  totalNonDeleted: number;
  withPrice: number;
  withoutPrice: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  message: string;
}
