import { Test, type TestingModule } from '@nestjs/testing';
import { CodeStatementService } from './code-statement.service';

describe('CodeStatementService', () => {
  let service: CodeStatementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeStatementService],
    }).compile();

    service = module.get<CodeStatementService>(CodeStatementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
