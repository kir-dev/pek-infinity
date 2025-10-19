---
file: database/00-realm-model.md
purpose: "Realm concept, why realmId exists, which models need it, how queries must filter"
triggers: ["creating new domain", "querying database", "enforcing data isolation", "adding schema field"]
keywords: ["realm", "realmId", "isolation", "constraint", "filter", "data-leakage", "multi-tenancy"]
dependencies: ["architecture/00-federation-model.md"]
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"




---

# Realm Model: Multi-Tenancy via realmId

## What is a Realm?

A **realm** is an isolated data boundary. Each realm:
- Has unique ID (e.g., "cloud", "enterprise-acme-corp", "conference-2025")
- Owns specific data (groups, memberships, evaluations)
- Is governed by own policies
- Has no visibility into other realms (unless explicitly bridged)

**Examples:**
- Cloud realm: `"cloud"` - SchönHerz central
- Enterprise realm: `"enterprise-acme-corp"` - Acme Corporation department
- Event realm: `"conference-vik-2025"` - VIK conference 2025

## Why realmId?

**Problem**: Without realm isolation, queries return data from all realms.

```typescript
// ❌ BAD: No realm filter
const groups = await prisma.group.findMany();
// Returns: Groups from cloud + all enterprises + all events
// Data leakage!

// ✅ GOOD: With realm filter
const groups = await prisma.group.findMany({
  where: { realmId: "cloud" }
});
// Returns: Only cloud groups
```

**Solution**: Every model that has realm-specific data includes `realmId` field.

## Which Models Need realmId?

### ✅ Needs realmId (Realm-Specific Data)

| Model | Why | Example |
|-------|-----|---------|
| `Group` | Each realm has own groups | Cloud groups ≠ Enterprise groups |
| `Membership` | Realms have different members | Alice member in cloud, not in enterprise-acme |
| `Semester` | Realms have own semesters | Cloud semester != Event realm semester |
| `Scoreboard` | Evaluations per realm | Cloud evaluations != Enterprise evaluations |
| `Guideline` | Evaluation criteria per realm | Cloud guidelines != Event guidelines |
| `FeatureFlag` | Features enabled per realm | Feature X enabled in cloud, disabled in enterprise |
| `PolicyAssignment` | Policies per realm | Alice is GOD in cloud, Manager in enterprise-acme |
| `Statement` | Permissions per realm | Cloud GOD has different permissions than enterprise GOD |

### ❌ Does NOT Need realmId (Global Data)

| Model | Why | Example |
|-------|-----|---------|
| `User` | Single identity across all realms | Alice is one user globally |
| `Profile` | Single profile per user (in cloud) | Alice's name/email stored once in cloud |
| `Policy` (base) | Can be inherited across realms* | Hierarchy policy can be reused |
| `ExternalAccountLink` | Linked to user profile | Alice's Twitter linked to her global profile |

*Note: In practice, enterprises might have their own policies. Add realmId to Policy if policy isn't shared.

## Prisma Schema: Adding realmId

### Step 1: Create Realm Model

```prisma
model Realm {
  id   String @id @default(cuid())
  name String @unique
  
  // Relations
  groups              Group[]
  memberships         Membership[]
  policyAssignments   PolicyAssignment[]
  statements          Statement[]
  scoreboards         Scoreboard[]
  guidelines          GuidelineCollection[]
  featureFlags        FeatureFlag[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 2: Add realmId to Models

#### Group Model
```prisma
model Group {
  id       String @id @default(cuid())
  name     String
  realmId  String
  realm    Realm  @relation(fields: [realmId], references: [id])
  
  // ... other fields
  
  @@unique([name, realmId])  // ← Group names unique per realm
  @@index([realmId])
}
```

#### Membership Model
```prisma
model Membership {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  groupId  String
  group    Group  @relation(fields: [groupId], references: [id])
  realmId  String
  realm    Realm  @relation(fields: [realmId], references: [id])
  
  // ... other fields
  
  @@unique([userId, groupId, realmId])  // ← Membership unique per realm
  @@index([realmId])
}
```

#### PolicyAssignment Model
```prisma
model PolicyAssignment {
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  policyId Int
  policy   Policy @relation(fields: [policyId], references: [id])
  realmId  String
  realm    Realm  @relation(fields: [realmId], references: [id])
  
  @@id([userId, policyId, realmId])  // ← Composite key with realm
  @@index([realmId])
}
```

### Step 3: Update Queries

#### Bad Query (Missing Realm Filter)
```typescript
// ❌ This retrieves from ALL realms
const groups = await prisma.group.findMany();
```

#### Good Query (With Realm Filter)
```typescript
// ✅ This retrieves only from specified realm
const groups = await prisma.group.findMany({
  where: { realmId: realm }
});

// ✅ With additional filters
const groups = await prisma.group.findMany({
  where: { 
    realmId: realm,
    parentId: null,  // Top-level groups
  }
});
```

## Common Gotchas

### ❌ Gotcha 1: Unique Constraint Without Realm

```prisma
// ❌ BAD: Name is unique globally
model Group {
  name String @unique
  // ...
}
// Problem: Can't create "engineering" group in two realms!
```

**Fix**: Make unique constraint include realmId

```prisma
// ✅ GOOD: Name unique per realm
model Group {
  name    String
  realmId String
  // ...
  @@unique([name, realmId])
}
```

### ❌ Gotcha 2: Querying Across Realms Accidentally

```typescript
// ❌ BAD: No realm filter
const userGroups = await prisma.membership.findMany({
  where: { userId: alice.id }
});
// Returns: Alice's memberships in ALL realms!

// ✅ GOOD: Filter by realm
const userGroups = await prisma.membership.findMany({
  where: { 
    userId: alice.id,
    realmId: realm  // Only this realm
  }
});
```

### ❌ Gotcha 3: Cascading Escalation Across Realms

```typescript
// ❌ BAD: Escalation adds to parent policy without realm check
async function createGroup(data: GroupCreateInput, realm: string) {
  // Create group
  const group = await prisma.group.create({
    data: { ...data, realmId: realm }
  });
  
  // ❌ Add escalation to parent policy
  // But parent might be in different realm!
  const parentGroup = await prisma.group.findUnique({
    where: { id: data.parentId }
  });
  
  // What if parent is in 'enterprise-a' and child in 'enterprise-b'?
}
```

**Fix**: Verify parent realm matches child realm

```typescript
async function createGroup(data: GroupCreateInput, realm: string) {
  // Verify parent exists in same realm
  const parentGroup = await prisma.group.findUnique({
    where: { id_realmId: { id: data.parentId, realmId: realm } }
  });
  
  if (!parentGroup) {
    throw new Error('Parent group not in this realm');
  }
  
  // Create group
  const group = await prisma.group.create({
    data: { ...data, realmId: realm }
  });
}
```

## Testing Realm Isolation

### Unit Test: Realm Filter

```typescript
describe('Realm isolation', () => {
  it('should only return groups from specified realm', async () => {
    // Create groups in two realms
    await createGroup('engineering', 'cloud');
    await createGroup('engineering', 'enterprise-acme');
    
    // Query cloud realm
    const cloudGroups = await prisma.group.findMany({
      where: { realmId: 'cloud' }
    });
    
    expect(cloudGroups).toHaveLength(1);
    expect(cloudGroups[0].realmId).toBe('cloud');
  });

  it('should prevent cross-realm queries', async () => {
    // Try to find group by ID without realm filter
    const group = await prisma.group.findUnique({
      where: { id: 'group-123' }  // ❌ No realm!
    });
    
    // This should fail or return unpredictable result
    // (Better: Enforce realm filter in types)
  });
});
```

### Integration Test: Cascading Respects Realm

```typescript
describe('Group creation with cascading', () => {
  it('should escalate to parent in same realm only', async () => {
    const cloudParent = await createGroup('cloud-parent', 'cloud');
    const enterpriseParent = await createGroup('enterprise-parent', 'enterprise-acme');
    
    // Create child under cloud parent (in cloud realm)
    const cloudChild = await createGroup(
      { parentId: cloudParent.id, name: 'cloud-child' },
      'cloud'
    );
    
    // Verify escalation added to cloud policy
    const cloudEscalation = await prisma.statement.findFirst({
      where: { 
        groupIdRestrict: cloudChild.id,
        policy: { name: 'GOD in cloud' }
      }
    });
    expect(cloudEscalation).toBeDefined();
    
    // Verify NO escalation to enterprise policy
    const enterpriseEscalation = await prisma.statement.findFirst({
      where: { 
        groupIdRestrict: cloudChild.id,
        policy: { name: 'GOD in enterprise' }
      }
    });
    expect(enterpriseEscalation).toBeNull();
  });
});
```

## Migration: Adding Realm

### For MVP (Single Cloud Realm)

1. Add `Realm` model
2. Create default realm: `{ id: 'cloud', name: 'Cloud' }`
3. Add `realmId` to all required models with `@default('cloud')`
4. Make realmId NOT NULL after backfill
5. Add indexes on realmId

### For Enterprise (Multiple Realms)

1. Same as MVP
2. Create instance realms when deploying new instances
3. Update user_realms table to track user's instances
4. Cache user's instances on login

## Realm Checklist

- [ ] Realm model created
- [ ] realmId added to all applicable models
- [ ] Unique constraints include realmId (if needed)
- [ ] All queries filter by realmId
- [ ] Parent validation checks realm (for cascading)
- [ ] Tests verify realm isolation
- [ ] Migration scripts prepared
- [ ] No hardcoded realm IDs (use variables)

## Next Steps

- `database/01-policy-system.md` - Policies and realm isolation
- `rules/00-realm-isolation.md` - Enforcement rules
- `gotchas/00-common-mistakes.md` - Realm-related bugs

---

**Last updated**: 2025-10-20
