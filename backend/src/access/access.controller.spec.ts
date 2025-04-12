import { Test, type TestingModule } from '@nestjs/testing';
import { AccessRoleController } from './access-authorization.controller';

describe('AccessController', () => {
  let controller: AccessRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessRoleController],
    }).compile();

    controller = module.get<AccessRoleController>(AccessRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
