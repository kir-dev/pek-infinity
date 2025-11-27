---
purpose: "MUST: Zod schemas satisfy Prisma types. Type safety, prevention of silent bugs"
triggers: ["creating schema", "code review for types", "debugging type mismatch"]
keywords: ["Zod", "schema", "Prisma", "type", "satisfy", "validation", "safety"]
importance: "high"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





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

## Why It Matters

### The Silent Bug Problem

**If Prisma.Group changes and schema doesn't → COMPILER ERROR**

Without `satisfies`, schemas and Prisma types can drift.