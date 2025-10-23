---
file: implementation/04-domain-structure.md
purpose: "File organization within domain, index.ts public API exports, naming conventions, colocalization rationale"
triggers: ["creating new domain", "organizing domain files", "code review for structure"]
keywords: ["domain", "folder", "index.ts", "exports", "organization", "colocalization", "naming"]
dependencies: ["decisions/02-why-colocate-domains.md", "architecture/02-service-patterns.md"]
urgency: "medium"
size: "1200 words"
template: true
sections: ["structure", "file-organization", "index-exports", "naming-conventions", "colocalization", "real-example", "anti-patterns", "checklist"]
status: "active"




---

# Domain Structure: Organization & Exports

## Expected Folder Layout

Domains are organized around business concepts, not technology layers.

```
src/domains/
├── group/                                  # Domain: Group management
│   ├── group.ts                           # Service + procedures + serverFn (COLOCALIZED)
│   ├── types/
│   │   └── group.schema.ts               # Zod schemas (input validation + types)
│   ├── index.ts                          # Public API exports
│   ├── __tests__/
│   │   ├── group.service.spec.ts
│   │   ├── group.procedures.spec.ts
│   │   └── group.integration.spec.ts
│   └── README.md                         # Domain documentation (optional)
│
├── user/
│   ├── user.ts                           # Service + procedures + serverFn
│   ├── types/
│   │   └── user.schema.ts
│   ├── index.ts
│   ├── __tests__/
│   │   ├── user.service.spec.ts
│   │   └── user.procedures.spec.ts
│   └── README.md
│
├── policy/
│   ├── policy.ts
│   ├── types/
│   │   └── policy.schema.ts
│   ├── index.ts
│   ├── __tests__/
│   │   └── policy.service.spec.ts
│   └── README.md
│
└── prisma/                               # Special domain for DB access
    ├── prisma.ts
    ├── index.ts
    └── README.md
```

**NOT like this:**
```
❌ Don't organize by technology:
src/
├── services/
│   ├── group.service.ts
│   ├── user.service.ts
│   └── policy.service.ts
├── hooks/
│   ├── useGroup.ts
│   ├── useUser.ts
│   └── usePolicy.ts
├── components/
│   ├── GroupCard.tsx
│   ├── UserProfile.tsx
│   └── PolicyList.tsx
```

---

## File Organization Within Domain

### group.ts: Everything Colocalized

One file contains service layer, tRPC procedures, and serverFn. Why? They're the same API surface.

```typescript
// group.ts
import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { procedure, router } from '@trpc/server';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { PrismaService } from '@/domains/prisma';
import { authGuard, SCOPE } from '@/middleware';
import { GroupSchema, GroupCreateSchema } from './types/group.schema';

// ✅ SERVICE LAYER (reusable business logic)
@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.group.create({ data });
  }
}

// ✅ tRPC PROCEDURES (MVP + Worker)
export const groupProcedures = {
  findOne: procedure
    .input(z.object({ id: z.cuid() }))
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .query(async ({ input, ctx: { groupService } }) => {
      return groupService.findOne(input.id);
    }),

  create: procedure
    .input(GroupCreateSchema)
    .middleware([authGuard([SCOPE.GROUP_CREATE])])
    .mutation(async ({ input, ctx: { groupService } }) => {
      return groupService.create(input);
    }),
};

// ✅ tRPC ROUTER (exposes procedures)
export const groupRouter = router({
  group: router(groupProcedures),
});

// ✅ serverFn (client-facing RPC)
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.cuid() }))
  .middleware([jwtGuard, routingMiddleware(groupProcedures.findOne)])
  .handler(async ({ context: { responses } }) => {
    return responses.successResponses[0]?.data;
  });

export const createGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(GroupCreateSchema)
  .middleware([jwtGuard, routingMiddleware(groupProcedures.create)])
  .handler(async ({ context: { responses } }) => {
    return responses.successResponses[0]?.data;
  });
```

**Why colocalize?**
- Same API surface (validation, auth, business logic)
- Changes affect all three together
- Single source of truth for behavior
- No file jumping to understand feature

**Line count target:** 300-400 lines per domain file (if larger, split into related domains)

---

## types/domain.schema.ts: Validation & Types

All Zod schemas for the domain, must satisfy Prisma types.

```typescript
// types/group.schema.ts
import { z } from 'zod';
import * as Prisma from '@prisma/client';

// ✅ Base schema (satisfies Prisma.Group)
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1).max(255),
  description: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
  isCommunity: z.boolean(),
  isResort: z.boolean(),
  isTaskForce: z.boolean(),
  hasTransitiveMembership: z.boolean(),
  isArchived: z.boolean(),
  parentId: z.cuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Prisma.Group>;

// ✅ Derived schemas (pick/omit/extend from base)
export const GroupCreateSchema = GroupSchema.omit({
  id: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
}).strict();

export const GroupUpdateSchema = GroupSchema.pick({
  id: true,
  name: true,
  description: true,
  purpose: true,
}).partial().required({ id: true });

// ✅ Query schemas
export const GroupFindSchema = GroupSchema.pick({ id: true });
export const GroupListSchema = z.object({
  skip: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(20),
});

// ✅ Export types from schemas
export type Group = z.infer<typeof GroupSchema>;
export type GroupCreate = z.infer<typeof GroupCreateSchema>;
export type GroupUpdate = z.infer<typeof GroupUpdateSchema>;
```

**Location rule:**
- Domain-specific: `src/domains/{domain}/types/{domain}.schema.ts`
- Shared (auth, pagination): `src/types/`

---

## index.ts: Public API Boundary

index.ts exports ONLY what external code needs. It's the contract.

```typescript
// index.ts
// ✅ Export service (for testing, DI)
export { GroupService } from './group';

// ✅ Export procedures (for tRPC router)
export { groupProcedures, groupRouter } from './group';

// ✅ Export serverFn (for client)
export { getGroupFn, createGroupFn, updateGroupFn, deleteGroupFn } from './group';

// ✅ Export schemas & types
export type { Group, GroupCreate, GroupUpdate } from './types/group.schema';
export { GroupSchema, GroupCreateSchema, GroupUpdateSchema } from './types/group.schema';

// ❌ DON'T export internal helpers
// export { internalHelper } from './group';  // Internal only!
```

**What to export:**
- ✅ Service class (for testing, other domains)
- ✅ tRPC procedures & router
- ✅ serverFn functions
- ✅ Public types
- ✅ Public schemas

**What NOT to export:**
- ❌ Private helpers
- ❌ Internal middleware
- ❌ Temporary constants
- ❌ Test utilities

---

## Naming Conventions

```typescript
// Files
// ✅ domain.ts (service + procedures + serverFn)
// ✅ types/domain.schema.ts
// ✅ index.ts
// ❌ group.service.ts (don't split by type)
// ❌ group.procedures.ts (don't split by type)

// Classes
// ✅ GroupService
// ✅ PolicyService
// ❌ Group (confuses with entity)
// ❌ GroupServiceImpl (unnecessary)

// Functions (procedures & serverFn)
// ✅ findOne, findMany, create, update, delete (service-like names)
// ✅ groupProcedures (collection name)
// ✅ getGroupFn, createGroupFn (action + Fn suffix)
// ❌ group_find_one (underscore)
// ❌ GetGroup (PascalCase for function)

// Schemas
// ✅ GroupSchema, GroupCreateSchema, GroupUpdateSchema
// ✅ GroupFindSchema, GroupListSchema
// ❌ createGroupInput (use Dto suffix only if needed)
// ❌ IGroup (Hungarian notation)

// Routers
// ✅ groupRouter (exposes procedures)
// ✅ groupRouter.group.findOne()
// ❌ GroupRouter (PascalCase)
// ❌ groupApi (vague)
```

---

## Colocalization: Why Not Split by Type?

**Tempting but wrong:**
```
❌ group/
   ├── service.ts      (Lots of file jumping!)
   ├── procedures.ts   (Related concepts scattered)
   ├── serverFn.ts     (Same API surface, different files)
   └── types/
       └── schema.ts
```

**Why this fails:**
1. Service + procedures implement same logic (should be together)
2. serverFn calls procedures (import from sibling file every time)
3. Changes require touching 3 files instead of 1
4. Onboarding new developer: "Where's the group feature?" (scattered)

**Correct approach:**
```
✅ group/
   ├── group.ts        (Service + procedures + serverFn = ONE concept)
   ├── types/
   │   └── group.schema.ts
   └── index.ts
```

---

## Real Example: User Domain

```typescript
// user.ts (COMPLETE)
import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { procedure, router } from '@trpc/server';
import { createServerFn } from '@tanstack/react-start';
import { PrismaService } from '@/domains/prisma';
import { authGuard, SCOPE } from '@/middleware';
import { UserSchema, UserUpdateSchema } from './types/user.schema';

// SERVICE
@injectable()
export class UserService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }
}

// PROCEDURES
export const userProcedures = {
  findOne: procedure
    .input(UserSchema.pick({ id: true }))
    .middleware([authGuard([SCOPE.USER_VIEW_BASIC])])
    .query(async ({ input, ctx: { userService } }) => {
      return userService.findOne(input.id);
    }),

  update: procedure
    .input(UserUpdateSchema)
    .middleware([authGuard([SCOPE.USER_EDIT])])
    .query(async ({ input, ctx: { user, userService } }) => {
      // Only admins or self can update
      if (user.id !== input.id && !user.isAdmin) {
        throw new Error('Cannot update other users');
      }
      return userService.update(input.id, input);
    }),
};

export const userRouter = router({ user: router(userProcedures) });

// serverFn
export const getUserFn = createServerFn({ method: 'GET' })
  .inputValidator(UserSchema.pick({ id: true }))
  .middleware([jwtGuard, routingMiddleware(userProcedures.findOne)])
  .handler(async ({ context: { responses } }) => responses.successResponses[0]?.data);

export const updateUserFn = createServerFn({ method: 'POST' })
  .inputValidator(UserUpdateSchema)
  .middleware([jwtGuard, routingMiddleware(userProcedures.update)])
  .handler(async ({ context: { responses } }) => responses.successResponses[0]?.data);

// index.ts
export { UserService } from './user';
export { userProcedures, userRouter } from './user';
export { getUserFn, updateUserFn } from './user';
export type { User, UserUpdate } from './types/user.schema';
export { UserSchema, UserUpdateSchema } from './types/user.schema';
```

---

## Anti-Patterns to Avoid

**❌ Pattern 1: Technology-layered folders**
```
src/services/group.service.ts
src/hooks/useGroup.ts
src/components/GroupCard.tsx
```

**✅ Instead:** Colocalize in domain

**❌ Pattern 2: Exporting internal helpers**
```typescript
// index.ts
export { internalHelper, validateGroupName, groupUtils };
```

**✅ Instead:** Keep internals private
```typescript
// index.ts
export { GroupService, groupRouter, getGroupFn };
```

**❌ Pattern 3: Large monolithic domains**
```
// Over 1000 lines in group.ts
```

**✅ Instead:** Split related domains (if necessary)
```
group/
├── group.ts          (core group operations)
├── group-hierarchy.ts (hierarchy-specific)
└── group-archive.ts  (archive-specific)
```

---

## PR Checklist

- [ ] Domain follows folder structure (types/, __tests__/, index.ts)
- [ ] group.ts colocates service + procedures + serverFn
- [ ] No file > 500 lines (consider split if larger)
- [ ] types/domain.schema.ts has all schemas with satisfies
- [ ] index.ts exports only public API
- [ ] Naming follows conventions (no underscores, PascalCase for classes only)
- [ ] Service class uses @injectable() and @inject()
- [ ] Procedures organized in groupProcedures object
- [ ] serverFn functions use Fn suffix
- [ ] All schemas exported from index.ts
- [ ] README.md documents domain purpose (optional but nice)
- [ ] __tests__/ has setup mirroring structure
- [ ] No circular imports (check with import-sort)

