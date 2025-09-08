import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExternalSyncService } from './external-sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('external-sync')
@Controller('external-sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ExternalSyncController {
  constructor(private readonly externalSyncService: ExternalSyncService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Manually trigger external API synchronization' })
  @ApiResponse({
    status: 200,
    description: 'Synchronization completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Sync completed' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Synchronization failed' })
  async triggerSync() {
    return await this.externalSyncService.triggerSync();
  }
}
