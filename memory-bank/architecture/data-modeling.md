---
purpose: "Guide on mapping Database Tables to Zod Schemas and DTOs"
triggers: ["creating new domain", "adding database fields"]
keywords: ["prisma", "zod", "dto", "schema", "modeling"]
importance: "high"
size: "400 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Data Modeling

We use a strict flow to transform raw database records into type-safe DTOs for the API.

## The Flow
1.  **Prisma Schema**: Define the database table in `schema.prisma`.
2.  **Zod Schema**: Create a Zod schema that mirrors the Prisma model.
3.  **DTOs**: Derive specific DTOs (Data Transfer Objects) from the base Zod schemas using `.pick()`, `.omit()`, or `.extend()`.

## Rules
-   **Single Source of Truth**: The Zod schema in `*.schema.ts` should be the baseline.
-   **Explicit DTOs**: Never expose the raw Prisma model directly in the API. Always return a DTO.
-   **Validation**: Use Zod for runtime validation of all inputs.

## Canonical Example
See `full-stack/src/domains/group/api/group.schema.ts`.

```typescript
// Base Schema
export const GroupSchema = z.object({
  id: GroupId,
  name: z.string().min(1),
  // ...
});

// DTO (Input)
export const GroupCreateSubGroupDto = GroupSchema.pick({
  name: true,
  description: true,
}).extend({
  idJustName: z.string().regex(/^[a-z0-9-]+$/),
});
```
