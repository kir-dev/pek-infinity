---
file: reference/01-er-diagram.md
purpose: "Database entity relationships, cardinality, composite keys, realm boundaries"
triggers: ["understanding database schema", "designing new features", "migration planning"]
keywords: ["ER", "diagram", "entity", "relationship", "schema", "cardinality", "foreign key", "realm"]
dependencies: ["database/00-realm-model.md", "database/01-policy-system.md"]
urgency: "medium"
size: "1000 words"
sections: ["entity-relationship-diagram", "key-relationships", "composite-keys", "realm-boundaries", "cardinality-notes"]
status: "active"




---

# Reference: Entity Relationship Diagram

## Core ER Diagram (Realm-Agnostic)

```
┌──────────────────────────────────────────────────────────────────────┐
│                  PÉK INFINITY ER DIAGRAM                             │
│                    (All entities have realmId)                       │
└──────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │       User          │
                        ├─────────────────────┤
                        │ id (cuid)           │ ◄──┐
                        │ realmId             │    │ (composite key)
                        │ authSchId           │    │
                        │ @@id([id,realmId])  │    │
                        └─────────────────────┘    │
                               ▲                   │
                               │                   │
                    ┌──────────┴─────────┐         │
                    │                    │         │
              ┌─────┴──────┐      ┌──────┴─────┐   │
              │  Profile   │      │  Membership │   │
              ├────────────┤      ├─────────────┤   │
              │ id (cuid)  │      │ id          │───┘
              │ realmId    │      │ groupId     │
              │ firstName  │      │ groupRealmId
              │ lastName   │      │ userId      │◄──┐ (user from same realm)
              │ email      │      │ userRealmId │   │
              │ phone      │      │ realmId     │   │
              │            │      │ flairs[]    │   │
              │ @@id([...])│      │ @@id([...])│   │
              └────────────┘      └─────────────┘   │
                    ▲                                 │
                    │                                │
                    └─────────────────────────────────┘


              ┌──────────────────────┐
              │   MembershipStatus   │
              ├──────────────────────┤
              │ id (cuid)            │
              │ membershipId  ───┐   │
              │ realmId       ┌──┴─→ (FK to Membership)
              │ kind          │   │
              │ startDate     │   │
              │ untilDate     │   │
              │ @@id([id,...])│   │
              └──────────────────────┘


                    ┌─────────────────────┐
                    │      Group          │
                    ├─────────────────────┤
                    │ id (cuid)           │ ◄──┐
                    │ realmId             │    │ (composite)
                    │ name                │    │
                    │ parentId            │    │
                    │ parentRealmId   ────┘    │
                    │ purpose             │    │ (self-referential FK)
                    │ isArchived          │    │
                    │ isCommunity         │    │
                    │ isResort            │    │
                    │ isTaskForce         │    │
                    │ @@id([id,realmId])  │    │
                    │ @@fk([parentId,     │    │
                    │   parentRealmId]    │    │ (Can't be archived)
                    │   refs: [id,realmId]│   │ (Must same realm)
                    └─────────────────────┘    │
                           ▲                   │
                           └───────────────────┘

              ┌──────────────────────────┐
              │   MembershipStatus       │
              │  (from Membership ──┐    │
              │   with kind, dates │    │
              └──────────────────────────┘

                 ┌──────────────────────┐
                 │     Statement        │
                 ├──────────────────────┤
                 │ id (cuid)            │
                 │ policyId  ───┐       │
                 │ groupId   ────┤───┐  │
                 │ realmId   ────┘   │  │
                 │ permissions{...}  │  │
                 │ escalatedFrom  ◄──┘  │ (optional: parent group)
                 │ @@id([id,...]) │     │
                 └──────────────────────┘
                          ▲              
                          │              
         ┌────────────────┘              
         │                               
         └──────────────┐                
                        │                
         ┌──────────────┴────────┐      
         │                       │      
    ┌────┴─────────┐      ┌──────┴─────┐
    │   Policy     │      │  PolicyAssign
    ├──────────────┤      ├─────────────┤
    │ id (cuid)    │      │ id (cuid)   │
    │ realmId      │      │ userId  ────┤──> User (must same realm)
    │ name         │      │ realmId  │  │
    │ canIssue     │      │ policyId ┼──┤──> Policy (must same realm)
    │ type         │      │ assignedBy   │
    │ @@id([...])  │      │ assignedAt   │
    └──────────────┘      │ @@id([...]) │
                          └─────────────┘


         ┌──────────────────────────┐
         │   Evaluation/Scoring     │
         ├──────────────────────────┤
         │ id (cuid)                │
         │ realmId                  │
         │ groupId  ──────┐         │
         │ scoringDetails │───> Group
         │ guideline      │         │
         │ @@id([id,...]) │         │
         └──────────────────────────┘
```

---

## Composite Key Details

### Why Composite Keys (id, realmId)?

Every model uses `@@id([id, realmId])` because:

```typescript
// ✅ CORRECT: Composite key enforces realm isolation
model Group {
  id       String @id  // part 1: unique ID within realm
  realmId  String      // part 2: which realm owns this
  name     String

  @@id([id, realmId])  // Together = globally unique
  @@unique([id, realmId])
}

// ❌ WRONG: Single key allows realm mixing
model Group {
  id  String @id       // 'g1' could exist in multiple realms!
  realmId String       // Data leakage risk
}
```

### Example: Avoiding Realm Mixing

```typescript
// With composite keys:
const group = await prisma.group.findUnique({
  where: { id_realmId: { id: 'g1', realmId: 'hub' } }
});
// MUST specify realm → can't accidentally leak data

// Foreign keys MUST include realm:
model Membership {
  id           String
  groupId      String
  groupRealmId String  // ← Must match group's realm!
  
  @@foreign([groupId, groupRealmId], 
    references: [id, realmId],
    onDelete: CASCADE
  )
}

// Insertion prevented if realm mismatches:
await prisma.membership.create({
  data: {
    groupId: 'g1',
    groupRealmId: 'hub',  // ← Will validate!
    // If this realm doesn't have g1, FK constraint fails
  }
});
```

---

## Cardinality Relationships

### User → Profile (1:1)

```
User (id, realmId)
  │
  └─ One Profile per User
     (id, realmId)

Cardinality: 1:1
- Each User has exactly one Profile
- Each Profile belongs to one User
```

### User → Membership (1:N)

```
User (id, realmId)
  │
  ├─ Membership 1 (userId, realmId → Group A)
  ├─ Membership 2 (userId, realmId → Group B)
  └─ Membership N (userId, realmId → Group Z)

Cardinality: 1:N
- One User can have many Memberships
- One Membership belongs to one User
```

### Group → Membership (1:N)

```
Group (id, realmId)
  │
  ├─ Membership 1 (User1)
  ├─ Membership 2 (User2)
  └─ Membership N (UserN)

Cardinality: 1:N
- One Group can have many Members
- One Membership belongs to one Group
```

### Group → Group (Self-Referential, N:1)

```
Group (id, realmId)
  │
  ├─ parentId: 'parent' (FK)
  │  └─ Points to another Group (parent)
  │
  ├─ Child Group 1
  ├─ Child Group 2
  └─ Child Group N

Cardinality: N:1
- Many Groups can have same parent
- One Group has zero or one parent (nullable)

Constraints:
- Parent must be in same realm
- Parent can't be archived
- Can't create circular hierarchies
```

### Policy → Statement (1:N)

```
Policy (id, realmId)
  │
  ├─ Statement 1 (canViewMembers)
  ├─ Statement 2 (canEditMembers)
  └─ Statement N (canIssueAward)

Cardinality: 1:N
- One Policy has many Statements
- Statements define scoped permissions
```

### User → PolicyAssignment (N:M via join)

```
User ──(N:M)──> Policy

Via PolicyAssignment:

User (id1)
  │
  ├─ PolicyAssignment 1 ──> Policy (p1)
  ├─ PolicyAssignment 2 ──> Policy (p2)
  └─ PolicyAssignment N ──> Policy (pN)

User (id2)
  │
  ├─ PolicyAssignment 1 ──> Policy (p1)  (same policy, different user)
  ├─ PolicyAssignment 2 ──> Policy (p2)
  └─ PolicyAssignment N ──> Policy (pM)

Cardinality: N:M
- One User can have many Policies
- One Policy can be assigned to many Users
```

---

## Realm Boundaries

```
┌─────────────────────────────────────────┐
│         Hub Realm: 'hub'            │
├─────────────────────────────────────────┤
│                                         │
│  User (id1, realmId='hub')            │
│    └─ Profile (realmId='hub')         │
│       └─ Memberships (realmId='hub')  │
│          └─ Groups (realmId='hub')    │
│                                         │
│  User (id2, realmId='hub')            │
│    └─ Profile (realmId='hub')         │
│       └─ Memberships (realmId='hub')  │
│          └─ Groups (realmId='hub')    │
│                                         │
└─────────────────────────────────────────┘

              No cross-realm relationships!
        (FK constraints prevent mixing)

┌─────────────────────────────────────────┐
│   Worker Realm: 'ent-conf-2025'     │
├─────────────────────────────────────────┤
│                                         │
│  User (id3, realmId='ent-conf-2025')    │
│    └─ Profile (realmId='ent-conf-2025')│
│       └─ Memberships (realmId='...')    │
│          └─ Groups (realmId='...')      │
│                                         │
│  User (id4, realmId='ent-conf-2025')    │
│    └─ Profile (realmId='ent-conf-2025')│
│       └─ Memberships (realmId='...')    │
│          └─ Groups (realmId='...')      │
│                                         │
└─────────────────────────────────────────┘

Only exception: Hub → Worker
- Hub BFF reads user Profile from hub realm
- BFF queries instance API (separate database)
- No FK between hub and worker
```

---

## Query Patterns

### Find User's Groups (Same Realm)

```typescript
const userGroups = await prisma.membership.findMany({
  where: {
    userId: 'user1',
    realmId: 'hub',           // ← Explicit realm filter
    user: { realmId: 'hub' }  // ← Cascade check
  },
  include: {
    group: true,
  },
});
```

### Find Group's Active Members

```typescript
const members = await prisma.membership.findMany({
  where: {
    groupId: 'group1',
    groupRealmId: 'hub',      // ← Composite FK
    statuses: {
      some: {
        kind: 'ACTIVE',
      },
    },
  },
  include: {
    user: true,
  },
});
```

### Find Policy's All Assignees

```typescript
const assignees = await prisma.policyAssignment.findMany({
  where: {
    policyId: 'policy1',
    realmId: 'hub',
  },
  include: {
    user: { include: { profile: true } },
  },
});
```

### Cascade Delete (Archive Group)

```typescript
// When archiving parent, all children should also archive
await prisma.group.updateMany({
  where: {
    parentId: 'parent1',
    parentRealmId: 'hub',
    realmId: 'hub',
  },
  data: { isArchived: true },
});
```

