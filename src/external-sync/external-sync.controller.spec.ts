import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSyncController } from './external-sync.controller';
import { ExternalSyncService } from './external-sync.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('ExternalSyncController', () => {
  let controller: ExternalSyncController;
  let service: ExternalSyncService;

  const mockExternalSyncService = {
    triggerSync: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalSyncController],
      providers: [
        {
          provide: ExternalSyncService,
          useValue: mockExternalSyncService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    controller = module.get<ExternalSyncController>(ExternalSyncController);
    service = module.get<ExternalSyncService>(ExternalSyncService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerSync', () => {
    it('should trigger external API synchronization', async () => {
      const mockResult = { message: 'Sync completed' };
      mockExternalSyncService.triggerSync.mockResolvedValue(mockResult);

      const result = await controller.triggerSync();

      expect(service.triggerSync).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
