---
purpose: "Canonical guide for testing strategies and patterns"
triggers: ["writing tests", "debugging tests"]
keywords: ["testing", "vitest", "mocking", "unit test", "integration test"]
importance: "high"
size: "1300 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Testing Strategy

We use **Vitest** for all testing. Our strategy emphasizes **Unit Testing** for Services and **Integration Testing** for critical flows.

## Unit Testing Services
Services are tested in isolation. We mock the `PrismaService` to test business logic without hitting the database.

### Pattern
1.  **Setup**: Use `beforeEach` to clear the DI container and register a `MockPrismaService`.
2.  **Resolve**: Get the Service instance from the container.
3.  **Mock**: Define the expected behavior of the Prisma mock.
4.  **Act**: Call the Service method.
5.  **Assert**: Check the result and verify the mock was called correctly.

### Canonical Example
See `full-stack/src/domains/group/api/group.service.spec.ts`.

```typescript
describe('GroupService', () => {
  let mockPrisma: MockPrismaService;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = new MockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);
  });

  it('should find all groups', async () => {
    const groupService = container.resolve(GroupService);
    mockPrisma.group.findMany.mockResolvedValue([{ id: '1' }]);
    
    const result = await groupService.findMany();
    
    expect(result).toHaveLength(1);
    expect(mockPrisma.group.findMany).toHaveBeenCalled();
  });
});
```

## Software Testing Excellence Checklist

### Generic Rules Checklist (Applies to All Testing Types)
- [ ] **Test the Contract, Not the Implementation**: Focus on behavior and promises. If you only remember one rule, this is it.
- [ ] **Mock Everything External**: Keep tests deterministic by isolating external systems.
- [ ] **Fail Fast, Loud, and Specifically**: Ensure failures are pinpointed and actionable.

### Core Testing Mindsets
- [ ] **What’s the simplest thing that could possibly break?**
- [ ] **What’s the user actually trying to do—not what we think they’re doing?**
- [ ] **What are the invisible states here?**
- [ ] **How would an impatient or frustrated user break this and what is the worst possible input someone could give this?** (test('bad-inputs', () => {call(1), call(2), call(3), ...}))
- [ ] **What happens if everything is slow?**
- [ ] **What are the core invariants that must never be violated?**
- [ ] **If a bug existed, where would it hide?**
- [ ] **What assumptions did the engineers make—and which are wrong?**
- [ ] **How could this fail silently?**
- [ ] **How does this behave in the real world, not the lab?**
- [ ] **What happens if two users do this at the same time?**
- [ ] **Could the system succeed but the user think it failed?**
- [ ] **Could the system fail but the user think it succeeded?**
- [ ] **What’s the minimal test set that gives maximal confidence?**
- [ ] **What are the boundaries—and what happens just outside them?**
- [ ] **What is the system lying to us about?**
- [ ] **What breaks if we change nothing except time?**
- [ ] **Where is the single point of failure?**
- [ ] **No useless tests** The prisma team already tests the prisma client. Yes 1 + 1 is always 2. These are testing implementation, not behavior

### Unit Testing–Specific Checklist
- [ ] **Are dependencies mocked?**
- [ ] **Are edge cases tested (null, empty, zero, min/max)?**
- [ ] **Are invariants enforced at function-level precision?**
- [ ] **Does each test validate behavior, not implementation details?**
- [ ] **Are fast-feedback scenarios covered?**
- [ ] **Have floating-point, async, or concurrency quirks been tested?**

### End-to-End (E2E) Testing–Specific Checklist
- [ ] **Does the user journey match real user intent?**
- [ ] **Are all integration boundaries validated (auth, API, UI, data)?**
- [ ] **Are navigation, latency, and environmental changes tested?**
- [ ] **Are multi-device and multi-network scenarios considered?**
- [ ] **Are race conditions tested via concurrent flows?**
- [ ] **Is failure recovery behavior validated (retries, offline, partial states)?**
- [ ] **Are visual/UX affordances tested (feedback, loading, error messages)?**

### User Usability Testing–Specific Checklist
- [ ] **Can a new user complete the task without prior knowledge?**
- [ ] **Is the mental model simple, consistent, and predictable?**
- [ ] **Is it obvious when the system succeeded or failed?**
- [ ] **Does the flow support impatient or distracted users?**
- [ ] **Is there unnecessary cognitive load or ambiguity?**
- [ ] **Would users trust the system’s feedback and messaging?**
- [ ] **Are states and transitions understandable and visible?**

### Developer Experience (DX) Testing–Specific Checklist
- [ ] **Is the API intuitive without documentation?**
- [ ] **Are error messages actionable, specific, and helpful?**
- [ ] **Is setup friction minimal?**
- [ ] **Is the local development loop fast and reliable?**
- [ ] **Are defaults safe, stable, and predictable?**
- [ ] **Does misuse lead to informative errors instead of silent failures?**
- [ ] **Are logs, warnings, and traces clear and non-noisy?**

### Meta-Prompt Checklist (Reusable in Any Scenario)
- [ ] **“What’s the simplest thing that could break?”**
- [ ] **“Where would a bug hide?”**
- [ ] **“What invariant must never be violated?”**
- [ ] Use the combined prompt to map the full risk surface.
- [ ] **“A world-class software tester would approach this challenge by…”**
