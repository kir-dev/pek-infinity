---
file: rules/03-schema-validation.md
purpose: "MUST: Zod schemas satisfy Prisma types. Type safety, prevention of silent bugs"
triggers: ["creating schema", "code review for types", "debugging type mismatch"]
keywords: ["Zod", "schema", "Prisma", "type", "satisfy", "validation", "safety"]
dependencies: ["implementation/04-domain-structure.md", "gotchas/00-common-mistakes.md"]
urgency: "high"
enforcement: "must-follow"
size: "1000 words"
sections: ["the-rule", "why-it-matters", "how-to-use", "bad-examples", "good-examples", "checking-alignment", "testing", "checklist"]
status: "active"
mvp-scope: "current"
phase: "MVP 1.0"
created: "2025-11-17"
updated: "2025-11-17"
---

# Rule: Zod Schemas Must Satisfy Prisma Types

## The Rule (Absolute)

**Every Zod schema that represents a database model MUST use `satisfies` keyword to align with Prisma type.**

```typescript
// ❌ FORBIDDEN: No satisfies keyword
export const GroupSchema = z.object({
  id: z.string(),        // Might be string, but Prisma uses cuid()
  name: z.string(),
  description: z.string(),  // Might be optional in Prisma
});

// ✅ REQUIRED: Explicit type alignment
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1).max(255),
  description: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
  // ...
}) satisfies z.ZodType<Prisma.Group>;  // ← Type-checked against Prisma
```

---

## Why It Matters

### The Silent Bug Problem

Without `satisfies`, schemas and Prisma types can drift:

```typescript
// Scenario: Schema created without satisfies
export const UserSchema = z.object({
  id: z.string(),           // ← Generic string
  email: z.string(),
  role: z.string(),         // ← Generic string, could be anything
  isAdmin: z.boolean(),
  createdAt: z.string(),    // ← String instead of date!
});

// Prisma schema updated months later
model User {
  id       String @id @default(cuid())  // cuid(), not generic string!
  email    String @unique
  role     Enum('admin', 'user')        // Specific enum, not any string
  isAdmin  Boolean
  createdAt DateTime                    // DateTime, not string!
}

// Now they don't match, but NO ERROR!
// Bug: User sends role: "superadmin" → Prisma rejects it
// Bug: User sends createdAt: "2025-01-01" → Prisma stores as string?
// Bug: User sends id: "random123" → Prisma fails with cuid validation
```

**Result: Silent failures, hard to debug, security holes**

---

## How to Use `satisfies`

### Basic Pattern

```typescript
import * as Prisma from '@prisma/client';
import { z } from 'zod';

// Step 1: Create Zod schema
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1).max(255),
  description: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),  // Use Prisma enums!
  isCommunity: z.boolean(),
  isResort: z.boolean(),
  isTaskForce: z.boolean(),
  hasTransitiveMembership: z.boolean(),
  isArchived: z.boolean(),
  parentId: z.cuid().nullable(),
  createdAt: z.date(),  // Use z.date(), not z.string()
  updatedAt: z.date(),
});

// Step 2: Verify against Prisma type
export const GroupSchema = ... satisfies z.ZodType<Prisma.Group>;
//                                      ↑ Compiler error if types don't match!

// Step 3: Derive types from schema
export type Group = z.infer<typeof GroupSchema>;
```

**If Prisma.Group changes and schema doesn't → COMPILER ERROR**

### Create/Update Schemas (Partial)

```typescript
// Base schema (full model)
export const GroupSchema = z.object({...}) satisfies z.ZodType<Prisma.Group>;

// Create schema (omit id, timestamps)
export const GroupCreateSchema = GroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isArchived: true,  // Has default in DB
}).strict() satisfies z.ZodType<Omit<Prisma.GroupCreateInput, 'isArchived'>>;

// Update schema (pick certain fields, allow partial)
export const GroupUpdateSchema = GroupSchema
  .pick({ id: true, name: true, description: true })
  .partial()
  .required({ id: true })
  .strict() satisfies z.ZodType<Partial<Prisma.GroupUpdateInput> & { id: string }>;
```

---

## Real Bad Examples

### Example 1: Type Drift (String vs Enum)

```typescript
// ❌ BAD: No satisfies, schema drifts from Prisma
export const PolicySchema = z.object({
  name: z.string(),
  canIssue: z.boolean(),
  type: z.string(),  // ← Generic string
});

// Prisma model added enum
model Policy {
  // ...
  type PolicyType  // ← Specific enum: SIMONYI_ELNOK, BOARD_MEMBER, etc.
}

// Result: Validation passes for invalid types
const invalidPolicy = PolicySchema.parse({
  name: 'Invalid',
  type: 'FAKE_TYPE'  // ← Should be caught!
});
```

**Fix:**
```typescript
// ✅ GOOD: satisfies catches drift
export const PolicySchema = z.object({
  name: z.string(),
  canIssue: z.boolean(),
  type: z.enum(Prisma.$Enums.PolicyType),  // ← Enum from Prisma!
}) satisfies z.ZodType<Prisma.Policy>;

// If Prisma adds new enum value, schema must be updated
// Compiler forces alignment
```

### Example 2: Missing Required Field

```typescript
// ❌ BAD: Schema missing realm field that Prisma requires
export const GroupCreateSchema = z.object({
  name: z.string(),
  parentId: z.cuid().optional(),
});

// But Prisma requires realmId!
model Group {
  id       String
  realmId  String  // ← Required, not optional!
  name     String
}

// Validation passes, but insert fails
await prisma.group.create({
  data: GroupCreateSchema.parse({
    name: 'New Group',  // ← Missing realmId!
  }),
});
// Error: "realmId is required" (caught late)
```

**Fix:**
```typescript
// ✅ GOOD: satisfies catches missing field
export const GroupCreateSchema = z.object({
  name: z.string(),
  realmId: z.cuid(),  // ← Must include!
  parentId: z.cuid().optional(),
}) satisfies z.ZodType<Prisma.GroupCreateInput>;

// If realmId is removed from Prisma, compiler error alerts you
```

### Example 3: Wrong Type (String vs Date)

```typescript
// ❌ BAD: Schema uses string instead of date
export const EventSchema = z.object({
  name: z.string(),
  startTime: z.string(),  // ← String!
});

// But Prisma uses DateTime
model Event {
  startTime DateTime
}

// Validation passes with invalid data
const event = EventSchema.parse({
  name: 'Conference',
  startTime: '2025-01-01',  // ← Could be date or string
});

// Later: Can't compare dates, formatting issues, etc.
```

**Fix:**
```typescript
// ✅ GOOD: Use z.date() and satisfies
export const EventSchema = z.object({
  name: z.string(),
  startTime: z.date(),  // ← Date type!
}) satisfies z.ZodType<Prisma.Event>;

// Compiler enforces alignment
```

---

## Checking Schema Alignment

### Automated Check (TypeScript)

```bash
# If satisfies fails, TypeScript won't compile
npm run build

# Look for errors like:
# Type 'ZodObject<{ ... }>' does not satisfy the expected type 'ZodType<Group>'
# Type 'string' is not assignable to type 'number'
```

### Manual Verification

1. Open Prisma schema
2. Find model (e.g., `model Group`)
3. Compare fields one-by-one with Zod schema
4. Check types match (z.cuid() for cuid, z.date() for DateTime, etc.)
5. Check required vs optional (no nullable when required)

---

## Testing Schema Validation

```typescript
import { describe, it, expect } from 'vitest';
import { GroupSchema, GroupCreateSchema } from './types/group.schema';

describe('Group Schemas', () => {
  it('should accept valid group data', () => {
    const validData = {
      id: 'clg123456789abcdefghijklmn',  // Valid cuid
      name: 'Engineering',
      description: 'Engineering team',
      purpose: Prisma.$Enums.GroupPurpose.COMMITTEE,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    expect(() => GroupSchema.parse(validData)).not.toThrow();
  });
  
  it('should reject invalid id (not cuid)', () => {
    expect(() => GroupSchema.parse({
      ...validData,
      id: 'invalid-id',  // Not cuid format
    })).toThrow();
  });
  
  it('should reject invalid enum', () => {
    expect(() => GroupSchema.parse({
      ...validData,
      purpose: 'FAKE_PURPOSE',  // Not in Prisma enum
    })).toThrow();
  });
  
  it('should require realmId in create schema', () => {
    expect(() => GroupCreateSchema.parse({
      name: 'New Group',
      // Missing realmId!
    })).toThrow();
  });
});
```

---

## Enum Handling

Always use `Prisma.$Enums` for enums:

```typescript
// ✅ GOOD: Prisma enums
export const GroupSchema = z.object({
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
  status: z.enum(Prisma.$Enums.MembershipKind),
});

// ❌ BAD: Hardcoded enum strings
export const GroupSchema = z.object({
  purpose: z.enum(['COMMITTEE', 'CIRCLE', 'PROJECT']),  // ← Duplicated!
  status: z.enum(['NEWBIE', 'ACTIVE', 'FORMER']),
});

// Why bad? If Prisma enum changes, hardcoded values don't update
```

---

## PR Checklist

When reviewing PRs:

- [ ] Every schema has `satisfies z.ZodType<PrismaType>`
- [ ] Field types match Prisma (z.cuid() for cuid, z.date() for DateTime, etc.)
- [ ] Enums use `z.enum(Prisma.$Enums.XXX)`
- [ ] Required fields in Prisma are required in schema (no .optional())
- [ ] Optional fields in Prisma use .optional() or .nullable()
- [ ] .omit() used correctly for Create schemas
- [ ] Types exported via `z.infer<typeof Schema>`
- [ ] Tests verify invalid data is rejected
- [ ] Tests verify valid Prisma data is accepted
- [ ] No hardcoded enum strings (use Prisma.$Enums)

