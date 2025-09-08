import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSyncController } from './external-sync.controller';

describe('ExternalSyncController', () => {
  let controller: ExternalSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalSyncController],
    }).compile();

    controller = module.get<ExternalSyncController>(ExternalSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
