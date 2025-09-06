import { Module } from '@nestjs/common';
import { ExternalSyncService } from './external-sync.service';

@Module({
  providers: [ExternalSyncService]
})
export class ExternalSyncModule {}
