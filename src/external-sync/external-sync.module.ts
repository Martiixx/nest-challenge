import { Module } from '@nestjs/common';
import { ExternalSyncService } from './external-sync.service';
import { ExternalSyncController } from './external-sync.controller';

@Module({
  providers: [ExternalSyncService],
  controllers: [ExternalSyncController]
})
export class ExternalSyncModule {}
