import { Controller, Post, UseGuards } from '@nestjs/common';
import { ExternalSyncService } from './external-sync.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('external-sync')
@UseGuards(JwtAuthGuard)
export class ExternalSyncController {
  constructor(private readonly externalSyncService: ExternalSyncService) {}

  @Post('trigger')
  async triggerSync() {
    return await this.externalSyncService.triggerSync();
  }
}