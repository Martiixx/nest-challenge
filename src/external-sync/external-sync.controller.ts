import { Controller, Post } from '@nestjs/common';
import { ExternalSyncService } from './external-sync.service';

@Controller('external-sync')
export class ExternalSyncController {
  constructor(private readonly externalSyncService: ExternalSyncService) {}

  @Post('trigger')
  async triggerSync() {
    return await this.externalSyncService.triggerSync();
  }
}