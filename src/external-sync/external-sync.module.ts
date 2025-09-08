import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalSyncService } from './external-sync.service';
import { ExternalSyncController } from './external-sync.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  providers: [ExternalSyncService],
  controllers: [ExternalSyncController],
  imports: [HttpModule, ProductsModule],
})
export class ExternalSyncModule {}
