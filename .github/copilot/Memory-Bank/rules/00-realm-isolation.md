---
file: rules/00-realm-isolation.md
purpose: "MUST: Every query filters by realmId. Verification method, examples, test cases"
triggers: ["code review", "writing database query", "debugging data leakage"]
keywords: ["realm", "isolation", "filter", "query", "data-leakage", "must-follow"]
dependencies: ["database/00-realm-model.md", "architecture/00-federation-model.md"]
urgency: "critical"
enforcement: "must-follow"
size: "2000 words"
check-command: "grep -r 'findMany\\|findUnique\\|findFirst' src/domains/ | grep -v realmId"
status: "active"
created: "2025-10-20"




---

# Rule: Every Query Filters by realmId

## The Rule

**Every database query that returns realm-specific data MUST include realmId in the where clause.**

No exceptions. No shortcuts.

```typescript
// ❌ WRONG: Missing realmId filter
const groups = await prisma.group.findMany();

// ✅ CORRECT: Has realmId filter
const groups = await prisma.group.findMany({
  where: { realmId: realm }
});
```

## Why This Matters

**Data leakage = security bug.**

If queries cross realms:
1. Cloud data leaks to enterprises
2. Enterprise A sees Enterprise B's data
3. Users see data they shouldn't
4. Compliance violation (GDPR, etc.)

In MVP, consequences are limited (one realm). But code is tested in MVP, deployed in enterprise.

### Consequences of Violation

| Violation | Impact |
|-----------|--------|
| User in enterprise-acme sees groups from cloud | Data leakage |
| Policy query returns policies from all realms | Permission bypass |
| Membership query crosses realms | User sees memberships they don't have |
| Scoreboard query returns all realms | Evaluation data leakage |

## How to Check

### Manual: grep Command

```bash
# Find all queries without realm filter (approximate)
grep -r "findMany\|findUnique\|findFirst" src/domains/ \
  | grep -v "realmId" \
  | head -20
```

### Automated: Code Review

Before merging, check:
1. Any new `prisma.*` query
2. Does it include `where: { realmId: ... }`?
3. If not, ask: "Is this intentional?" (rare but possible)

### TypeScript Hint (Optional)

Encode realm filter in types:

```typescript
// Helper: Realm-filtered queries
export const createRealmFilter = (realmId: string) => ({
  realmId,
});

// Usage
const groups = await prisma.group.findMany({
  where: createRealmFilter(realm),
});
```

## Examples

### ❌ BAD: No Realm Filter

```typescript
// Query: Find all groups
const groups = await prisma.group.findMany();
// Result: Groups from ALL realms (data leakage!)

// Query: Find group by ID
const group = await prisma.group.findUnique({
  where: { id: 'group-123' }
});
// Result: Any group with that ID, any realm (ambiguous)

// Query: Find memberships for user
const memberships = await prisma.membership.findMany({
  where: { userId: 'alice' }
});
// Result: Alice's memberships in ALL realms!
```

### ✅ GOOD: Realm Filtered

```typescript
// Query: Find groups in cloud realm
const groups = await prisma.group.findMany({
  where: { realmId: 'cloud' }
});
// Result: Only cloud groups ✓

// Query: Find group by ID in cloud realm
const group = await prisma.group.findUnique({
  where: { id_realmId: { id: 'group-123', realmId: 'cloud' } }
});
// Result: Specific group in specific realm ✓

// Query: Find memberships in specific realm
const memberships = await prisma.membership.findMany({
  where: { 
    userId: 'alice',
    realmId: 'cloud'  // ← Added
  }
});
// Result: Alice's memberships in cloud realm only ✓
```

### ✅ GOOD: Complex Queries With Realm

```typescript
// Query: Find top-level groups in realm
const groups = await prisma.group.findMany({
  where: { 
    realmId: 'cloud',  // ← Realm filter
    parentId: null
  }
});

// Query: Find groups owned by user in realm
const groups = await prisma.group.findMany({
  where: {
    realmId: 'cloud',  // ← Realm filter
    memberships: {
      some: {
        userId: 'alice',
        statuses: {
          some: { type: 'ACTIVE' }
        }
      }
    }
  }
});

// Query: Find scoreboards with evaluations in realm
const scoreboards = await prisma.scoreboard.findMany({
  where: {
    realmId: 'cloud',  // ← Realm filter
    status: 'SUBMITTED',
    evaluation: {
      isNot: null
    }
  },
  include: {
    evaluation: true,
    pointRequests: true
  }
});
```

## Test Cases

### Test 1: Single Realm Query

```typescript
describe('Realm isolation: single realm query', () => {
  it('should return only groups from specified realm', async () => {
    // Setup
    await prisma.realm.create({ data: { id: 'cloud', name: 'Cloud' } });
    await prisma.realm.create({ data: { id: 'enterprise-a', name: 'Enterprise A' } });
    
    await prisma.group.create({
      data: { id: 'g1', name: 'Cloud Group', realmId: 'cloud' }
    });
    await prisma.group.create({
      data: { id: 'g2', name: 'Enterprise Group', realmId: 'enterprise-a' }
    });
    
    // Query: Find groups in cloud
    const groups = await prisma.group.findMany({
      where: { realmId: 'cloud' }
    });
    
    // Assert: Only cloud group returned
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('g1');
    expect(groups[0].realmId).toBe('cloud');
  });
});
```

### Test 2: Composite Key Query

```typescript
describe('Realm isolation: composite key', () => {
  it('should use composite key for unique lookups', async () => {
    // Setup: Same group name in two realms
    await prisma.group.create({
      data: { id: 'g1', name: 'engineering', realmId: 'cloud' }
    });
    await prisma.group.create({
      data: { id: 'g2', name: 'engineering', realmId: 'enterprise-a' }
    });
    
    // Query: Find 'engineering' in cloud
    const group = await prisma.group.findUnique({
      where: { 
        id_realmId: {  // ← Composite key
          id: 'g1',
          realmId: 'cloud'
        }
      }
    });
    
    // Assert: Got cloud group, not enterprise
    expect(group.id).toBe('g1');
  });
});
```

### Test 3: Filter Missing = Bug

```typescript
describe('Realm isolation: ensure filter is required', () => {
  it('should NOT allow unfiltered queries (type safety)', async () => {
    // This test documents that we COULD query without realm
    // but we've chosen to enforce it via code review
    
    const allGroups = await prisma.group.findMany();
    // ← This compiles but violates our rule
    
    // Code review catches it:
    // "Query crosses realms; add realmId filter"
  });
});
```

## Review Checklist

When reviewing code with database queries:

- [ ] Every `prisma.*.findMany()` has `where: { realmId: ... }`
- [ ] Every `prisma.*.findUnique()` uses composite key or filters by realmId
- [ ] Every `prisma.*.findFirst()` has `where: { realmId: ... }`
- [ ] Every `prisma.*.create()` includes realmId in data
- [ ] Every `prisma.*.update()` verifies realm ownership (find with realm filter first)
- [ ] Every `prisma.*.delete()` verifies realm ownership
- [ ] Joins across models respect realm boundaries (e.g., Group + Membership both in same realm)
- [ ] No queries like `findMany()` without any filters

## Common Mistakes

### ❌ Mistake 1: Querying Without Realm

```typescript
// ❌ BAD: Service doesn't filter
async function getGroupCount() {
  return prisma.group.count();
  // Counts groups from ALL realms
}

// ✅ GOOD: Service expects realm from caller
async function getGroupCount(realm: string) {
  return prisma.group.count({
    where: { realmId: realm }
  });
}
```

### ❌ Mistake 2: Realm Filter Only in Some Paths

```typescript
// ❌ BAD: One path filters, one doesn't
async function findGroups(search?: string, realm: string) {
  if (search) {
    return prisma.group.findMany({
      where: { name: { contains: search } }  // ❌ No realm!
    });
  } else {
    return prisma.group.findMany({
      where: { realmId: realm }  // ✓ Has realm
    });
  }
}

// ✅ GOOD: All paths filter
async function findGroups(search?: string, realm: string) {
  return prisma.group.findMany({
    where: {
      realmId: realm,  // ← Always
      ...(search ? { name: { contains: search } } : {})
    }
  });
}
```

### ❌ Mistake 3: Trusting Cascade to Filter

```typescript
// ❌ BAD: Assuming parent relationship filters realm
const groups = await prisma.group.findMany({
  where: {
    parentId: 'parent-group-id'
    // ❌ No explicit realmId filter
    // Hope: Parent is in cloud realm
    // Reality: Parent could be in any realm
  }
});

// ✅ GOOD: Explicit realm + parent
const groups = await prisma.group.findMany({
  where: {
    realmId: 'cloud',
    parentId: 'parent-group-id'
  }
});
```

## Enforcement

### Pre-Commit Hook (Optional)

```bash
#!/bin/bash
# .git/hooks/pre-commit
grep -r "prisma\." src/domains/ \
  | grep -E "findMany|findUnique|findFirst" \
  | grep -v "realmId" \
  && echo "ERROR: Query found without realmId filter" && exit 1
exit 0
```

### Code Review Bot (Optional)

Comment on PRs:
```
Query found without realmId filter:
src/domains/group/backend/group.service.ts:42
  const groups = await prisma.group.findMany();

Please add: where: { realmId: realm }
```

## Exceptions

**Are there exceptions to this rule?**

Rare, but yes:
- **Realm model itself** (querying realms to list them)
- **Global audit logs** (intentionally crossing realms)
- **Migration scripts** (backfilling data)

In these cases, add a comment:
```typescript
// ✓ INTENTIONAL: Query crosses realms (audit log)
const allActions = await prisma.auditLog.findMany();
```

## Next Steps

- `database/00-realm-model.md` - Understanding realmId
- `gotchas/00-common-mistakes.md` - Common realm bugs
- `rules/01-auth-enforcement.md` - Related: auth checks must also filter

---

**Last updated**: 2025-10-20
