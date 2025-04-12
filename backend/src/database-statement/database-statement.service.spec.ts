import { Test, type TestingModule } from '@nestjs/testing';
import { DatabaseStatementService } from './database-statement.service';

describe('DatabaseStatementService', () => {
  let service: DatabaseStatementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseStatementService],
    }).compile();

    service = module.get<DatabaseStatementService>(DatabaseStatementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
