---
applyTo: "/**/*spec.ts"
---

# AI Testing Instructions (for .spec.ts files)

Purpose: teach the AI agent practical, actionable testing skills and provide examples from the actual codebase that the assistant can reference when helping engineers write or review tests.

## Core Testing Principles

- Learn the intent: read feature goals, acceptance criteria, and user flows before designing tests.
- Test behaviours, not implementation: assert public contracts and observable outcomes.
- Make failures reproducible: include minimal repro steps, exact environment, logs, and a small failing script if possible.
- Keep tests deterministic: seed randomness, avoid time-based assertions, and isolate state.
- Prefer fast unit tests; reserve heavy scenarios for focused integration/E2E suites.
- Mock only external systems; use in-memory fakes for infra where feasible.
- Triage and fix flaky tests — quarantine only temporarily with a remediation plan.
- Use factories, fixtures, and helpers to avoid duplicated setup.
- Name tests by behaviour and intent; include a short comment for tricky cases.
- Validate fixes end-to-end and add observability checks for unstable areas.

## E2E Testing Setup

Standard setup pattern for NestJS e2e tests:

```typescript
describe('YourFeature (e2e)', () => {
  let app: INestApplication<App>;
  let mockPrismaService: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [YourModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });
});
```

Key points:
- Always initialize a fresh application instance for each test
- Set up global pipes and middleware that match production configuration
- Clean up resources after each test
- Use typed mock services

## Data Setup Patterns

### Mock State Setup

Create helper functions to set up consistent test states:

```typescript
function setupTestState() {
  mockPrismaService.entity.findMany.mockResolvedValue([
    { id: '1', name: 'test1' },
    { id: '2', name: 'test2' },
  ]);
  mockPrismaService.entity.findFirst.mockResolvedValue({
    id: '1', name: 'test1'
  });
}

function mockCleanState() {
  mockPrismaService.entity.findMany.mockResolvedValue([]);
  mockPrismaService.entity.findFirst.mockResolvedValue(null);
}
```

Benefits:
- Reusable mock data setup
- Consistent test states across related test cases
- Clear separation between different test scenarios

## Test Case Organization

Group related tests using describe blocks:

```typescript
describe('PATCH /endpoint', () => {
  const INVALID_INPUTS = [
    { input: 'invalid-format', reason: 'wrong format' },
    { input: '', reason: 'empty string' },
    { input: {}, reason: 'empty object' },
  ];

  it.each(INVALID_INPUTS)(
    'should reject invalid input: %p',
    async (invalidInput) => {
      setupTestState();

      await request(app.getHttpServer())
        .patch('/endpoint')
        .send(invalidInput)
        .expect(400);
    }
  );

  it('should accept valid input', async () => {
    setupTestState();

    await request(app.getHttpServer())
      .patch('/endpoint')
      .send(validInput)
      .expect(200);
  });
});
```

Key practices:
- Group related test cases
- Use parametrized tests for similar scenarios
- Test both success and error cases
- Verify response status codes and content types

## Prisma Mocking Guidelines

### Setting Up Mock Prisma Service

```typescript
const mockPrismaService = createMockPrismaService();

// Mock specific operations
mockPrismaService.entity.findUnique.mockResolvedValue(data);
mockPrismaService.entity.create.mockResolvedValue(newData);

// Mock transactions
mockPrismaService.$transaction.mockResolvedValue(undefined);
```

Best practices:
- Mock at the repository level
- Return realistic data shapes
- Consider edge cases (empty results, errors)
- Mock transactions when testing complex operations

## Common Mistakes to Avoid

- Sleeps/timing-based waits → use polling or explicit synchronization
- Testing private internals → test observable behaviour instead
- Over-mocking core logic → run integration tests with real components where reasonable
- Shared global state → reset state per test or use fresh fixtures
- Huge slow test suites → split into fast unit + narrower integration + minimal E2E

## Code Rules

- Do NOT import nestjs primitive classes such as Controller, Service and Module as type, only use the normal import for these classes.
- Always clean up resources in afterEach/afterAll blocks
- Use strongly typed mock data and services
- Keep test files alongside the code they test
- Follow AAA pattern: Arrange, Act, Assert

# Examples

<example>
  <doc_string>This example demonstrates refactoring a test to use a factory for creating test data, which reduces duplication and improves maintainability.</doc_string>
  <user_query>My tests for `semester.service` are getting repetitive. Every test creates a similar semester object with slight variations. Can you clean this up?</user_query>
  <assistant_response>
    <Thinking>
    The user wants to refactor their tests to be more DRY (Don't Repeat Yourself). The most effective pattern for this is a test data factory. I will create a `semester.factory.ts` file to handle the creation of semester objects. Then I will show the 'before' and 'after' of the `semester.service.spec.ts` to demonstrate how the factory simplifies the test setup.
    </Thinking>

    Of course. Using a test data factory is a great way to solve this. Here is how we can refactor your tests.

    ### Before: Repetitive Setup

    Notice how each `it` block has to manually create a `semester` object. This is verbose and hard to maintain.

    ```typescript file="backend/src/semester/semester.service.spec.ts"
    // ...
    it('should return a semester by id', async () => {
      const semester = {
        id: 'clwxa6y170000108u7e034wfs',
        year: 2024,
        season: 'FALL',
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.semester.findUnique.mockResolvedValue(semester);

      const result = await service.findOne(semester.id);

      expect(result).toEqual(semester);
    });
    ```

    ### After: Using a Factory

    First, we create a factory. This centralizes test data creation.

    ```typescript file="backend/test/factories/semester.factory.ts"
    import { Semester, Season } from '@prisma/client';

    // Using a simple function as a factory
    // For more complex scenarios, consider libraries like 'fishery'
    export const semesterFactory = {
      build: (attrs: Partial<Semester> = {}): Semester => {
        return {
          id: `clwxa6y170000108u7e034wfs`,
          year: 2025,
          season: 'SPRING' as Season,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-06-30'),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...attrs,
        };
      },
    };
    ```

    Now, the test becomes much cleaner.

    ```typescript file="backend/src/semester/semester.service.spec.ts"
    import { semesterFactory } from '../../test/factories/semester.factory';
    // ...
    it('should return a semester by id', async () => {
      const semester = semesterFactory.build();
      prisma.semester.findUnique.mockResolvedValue(semester);

      const result = await service.findOne(semester.id);

      expect(result).toEqual(semester);
    });

    it('should handle not found for a different id', async () => {
      const semester = semesterFactory.build({ id: 'some_other_id' });
      prisma.semester.findUnique.mockResolvedValue(semester);

      // ...
    });
    ```
  </assistant_response>
</example>

<example>
  <doc_string>This example shows how to refactor a brittle, over-mocked unit test into a more robust integration-style test that asserts behavior, not implementation.</doc_string>
  <user_query>This test for my service breaks every time I refactor the internal database calls. How can I make it more resilient?</user_query>
  <assistant_response>
    <Thinking>
    The user is experiencing a common problem with classic mocking: tests are too coupled to the implementation. A unit test that mocks every database call is essentially testing the mocks themselves, not the actual application logic or its integration with the database driver.

    The solution is to move up a level of abstraction. Instead of mocking `prisma.semester.findUnique`, we can provide a real, but test-isolated, Prisma client. This ensures we are testing the actual query an application will make, making the test more robust against refactoring.
    </Thinking>

    That's a sign that your test is too coupled to the implementation details. Let's refactor it from a strict unit test to an integration-style test.

    ### Before: Brittle Mock-Heavy Test

    This test deeply mocks the Prisma client. If you were to refactor `findOne` to use `findFirst` instead of `findUnique`, the test would fail even though the public behavior is identical.

    ```typescript file="backend/src/semester/semester.service.spec.ts"
    import { SemesterService } from './semester.service';
    import { PrismaService } from '../prisma/prisma.service';
    import { semesterFactory } from '../../test/factories/semester.factory';
    import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'

    describe('SemesterService', () => {
      let service: SemesterService;
      let prisma: DeepMockProxy<PrismaService>;

      beforeEach(() => {
        prisma = mockDeep<PrismaService>();
        service = new SemesterService(prisma);
      });

      it('finds a semester', async () => {
        const semester = semesterFactory.build();
        // Brittle: we are mocking the *how*, not testing the *what*
        prisma.semester.findUnique.mockResolvedValue(semester);

        await expect(service.findOne(semester.id)).resolves.toEqual(semester);
      });
    });
    ```

    ### After: Robust Integration-Style Test

    This version uses a real test database. The test now only cares that the service can save and retrieve a semester, regardless of the exact Prisma method used. This test is more resilient to refactoring. *Note: setting up a test database is a prerequisite.*

    ```typescript file="backend/src/semester/semester.service.spec.ts"
    import { SemesterService } from './semester.service';
    import { PrismaService } from '../prisma/prisma.service';
    import { Test } from '@nestjs/testing';
    import { PrismaModule } from '../prisma/prisma.module'; // Assuming you have this
    import { cleanDatabase } from '../../test/setup'; // A utility to reset the DB

    describe('SemesterService - Integration', () => {
      let service: SemesterService;
      let prisma: PrismaService;

      beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
          imports: [PrismaModule], // Connect to the real test database
          providers: [SemesterService],
        }).compile();

        service = moduleRef.get(SemesterService);
        prisma = moduleRef.get(PrismaService);
      });

      afterEach(async () => {
        await cleanDatabase(prisma); // Clean up after each test
      });

      it('creates and finds a semester by id', async () => {
        // Arrange: Create a record in the actual test database
        const createdSemester = await prisma.semester.create({
          data: {
            year: 2025,
            season: 'SPRING',
          },
        });

        // Act: Call the service method we want to test
        const foundSemester = await service.findOne(createdSemester.id);

        // Assert: The correct data was returned
        expect(foundSemester).toBeDefined();
        expect(foundSemester.id).toEqual(createdSemester.id);
      });
    });
    ```
  </assistant_response>
</example>
