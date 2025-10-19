---
file: database/03-user-profile-federation.md
purpose: "User and Profile models; single profile in cloud across federation, privacy scope restrictions, federation awareness"
triggers: ["implementing user queries", "designing profile access", "handling federated users", "privacy boundaries"]
keywords: ["user", "profile", "federation", "privacy", "scope", "basic-profile", "full-profile", "external-account"]
dependencies: ["database/00-realm-model.md", "architecture/00-federation-model.md"]
urgency: "high"
size: "1200 words"
status: "active"
created: "2025-10-20"




---

# User Profile: Federation Model and Privacy Scoping

## Core Concept

**Critical difference from other models:**

- **Groups, Policies, Scoreboards, etc.**: Exist per instance/realm (Groups in cloud are different from groups in enterprise-acme)
- **Users and Profiles**: **Centralized in cloud instance**—single source of truth across entire federation

A federated user (member of both cloud AND enterprise-acme) has ONE profile in cloud, but policies/memberships in both instances.

---

## Schema Models

### User Model

```prisma
model User {
  id          String     @id @default(cuid())
  authSchId   String     @unique  // From AuthSCH OAuth
  usernames   Username[]

  // Profile (cloud only)
  profile     Profile?

  // Memberships across instances
  memberships Membership[]

  // Community evaluation
  requestedEntryAwards   EntryAwardRequest[] @relation("EntryAwardRequester")
  evaluatedPointAwards   Evaluation[]
  evaluatedEntryAwards   EntryAwardRequest[] @relation("EntryAwardEvaluator")
  entries                EntryAwardRequest[]
  points                 PointHistory[]

  // Notifications
  receivedNotifications  Notification[] @relation("recipient")
  sentNotifications      Notification[] @relation("sender")

  // System
  createdAt              DateTime? @default(now())
  updatedAt              DateTime? @updatedAt
  lastLogin              DateTime?

  // Policies (why in User? See note below)
  appliedStatements      Statement[]
  permission             PolicyAssignment[] @relation("HasPolicy")
  assignedPermission     PolicyAssignment[] @relation("AssignedPolicy")
}

model Username {
  humanId   String   @id  // Human-readable username
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

**Field meanings:**
- `id`: Global user ID (same across federation)
- `authSchId`: OAuth subject from AuthSCH (immutable, unique)
- `profile`: Optional (user might not have filled it)
- `memberships`: Can be in groups across multiple instances
- `permission`: Policies assigned to this user (across instances)

**Note on policies in User:** Why are policies linked to User, not per-realm?
- Users can have policies in both cloud AND enterprise-acme
- But **querying policies must be realm-filtered**
- See: `rules/00-realm-isolation.md` - PolicyAssignment must filter by realm

### Profile Model

```prisma
model Profile {
  userId           String   @id @unique
  user             User     @relation(fields: [userId], references: [id])

  // Personal info
  firstName        String?
  lastName         String?
  nickname         String?
  cellPhone        String?
  room             String?

  // Metadata
  dormitory        Dormitory?            @default(UNKNOWN)
  gender           Gender?               @default(UNKNOWN)
  studentStatus    StudentStatus?        @default(UNKNOWN)

  // External accounts
  externalAccounts ExternalAccountLink[]

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum Dormitory {
  KARMAN
  TETENY
  SCH
  BAROSS
  BERCSENYI
  VASARHELYI
  EXTERNAL
  UNKNOWN
}

enum Gender {
  MALE
  FEMALE
  OTHER
  UNKNOWN
}

enum StudentStatus {
  ACTIVE
  GRADUATED
  OTHER
  UNKNOWN
}

model ExternalAccountLink {
  id          String                  @id @default(cuid())
  protocol    ExternalAccountProtocol
  accountName String
  ownerId     String
  owner       Profile                 @relation(fields: [ownerId], references: [userId])
}

enum ExternalAccountProtocol {
  X_FORMERLY_TWITTER     @map("twitter")
  SKYPE                  @map("skype")
  CALL_SIGN              @map("call_sign")
  IRC                    @map("irc")
  GTALK                  @map("gtalk")
  JABBER                 @map("jabber")
  META_FORMERLY_FACEBOOK @map("facebook")
  TELEGRAM               @map("Telegram")
  SCH_MAIL               @map("sch_mail")
  HIMZO                  @map("Hímzek")
  GMAIL                  @map("gmail")
  EASTER_EGG             @map("🍆")
}
```

**Field meanings:**
- `userId`: Foreign key to User (one-to-one)
- `firstName`, `lastName`, `nickname`: User's identity
- `dormitory`, `gender`, `studentStatus`: Metadata
- `externalAccounts`: Links to Twitter, Telegram, etc.

**⚠️ CRITICAL:** Profile has NO `realmId` field. Profiles exist in cloud only, shared across federation.

---

## Privacy Scoping: Basic vs Full Profile

### Basic Profile Scope

**Who can see this?** Anyone in any instance the user is in (allowilist only)

**Contains:**
- Name (firstName, lastName)
- Nickname
- Avatar/picture (from nickname)

**Query:**
```typescript
async function getBasicProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      nickname: true,
      // NOT: cellPhone, room, externalAccounts
    }
  });
  return profile;
}
```

### Full Profile Scope

**Who can see this?** Only when policy explicitly grants `viewFullProfile`

**Contains:**
- Everything from basic profile
- Cell phone
- Room number
- Dormitory
- Gender
- Student status
- External accounts

**Query:**
```typescript
async function getFullProfile(userId: string, viewerId: string, realm: string) {
  // Check if viewer has viewFullProfile permission
  const canView = await canUserPerformAction(
    viewerId,
    "viewFullProfile",
    userId,
    "USER",
    realm
  );

  if (!canView) {
    throw new Error("Permission denied");
  }

  return prisma.profile.findUnique({
    where: { userId },
    include: { externalAccounts: true }
  });
}
```

---

## Federation-Aware Queries

### User Exists in Instance

```typescript
async function userExistsInInstance(userId: string, instanceId: string) {
  // Check if user has ANY membership in this instance
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      group: {
        realmId: instanceId  // Groups in this realm
      }
    }
  });

  return membership !== null;
}
```

### Get User's Instances

```typescript
async function getUserInstances(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      group: {
        select: { realmId: true }
      }
    }
  });

  const realms = new Set(memberships.map(m => m.group.realmId));
  return Array.from(realms);
}

// Usage in BFF routing
const userInstances = await getUserInstances(userId);
// Returns: ["cloud", "enterprise-acme", "enterprise-xyz"]
// BFF queries each instance for user's data
```

### Cross-Instance User Search

```typescript
async function searchUsers(query: string, requesterId: string, realm: string) {
  // 1. Search profiles in cloud (basic info)
  const baseResults = await prisma.profile.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { nickname: { contains: query, mode: "insensitive" } }
      ]
    },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      nickname: true
    }
  });

  // 2. For each result, check if requester can see full profile
  const results = [];
  for (const profile of baseResults) {
    const canViewFull = await canUserPerformAction(
      requesterId,
      "viewFullProfile",
      profile.userId,
      "USER",
      realm
    );

    if (canViewFull) {
      results.push(await getFullProfile(profile.userId, requesterId, realm));
    } else {
      results.push(profile);  // Basic only
    }
  }

  return results;
}
```

---

## Common Mistakes

### ❌ WRONG: Creating multiple profiles per user

```typescript
// WRONG: Creates profile in each instance
const profile = await prisma.profile.create({
  data: { userId, firstName, realmId: realm }
});

// RIGHT: Single profile in cloud
const profile = await prisma.profile.create({
  data: { userId, firstName }
  // NO realmId - profiles are global
});
```

### ❌ WRONG: Not checking full profile permission

```typescript
// WRONG: Returns full profile without permission check
async function getUserProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: { externalAccounts: true }
  });
}

// RIGHT: Check permission first
async function getUserProfile(userId: string, viewerId: string, realm: string) {
  const canView = await canUserPerformAction(
    viewerId,
    "viewFullProfile",
    userId,
    "USER",
    realm
  );

  if (!canView) {
    return { firstName, lastName, nickname };  // Basic only
  }

  return prisma.profile.findUnique({
    where: { userId },
    include: { externalAccounts: true }
  });
}
```

### ❌ WRONG: Forgetting profile is optional

```typescript
// WRONG: Assumes profile always exists
const profile = await prisma.profile.findUnique({
  where: { userId }
});
const fullName = `${profile.firstName} ${profile.lastName}`;

// RIGHT: Handle null profile
const profile = await prisma.profile.findUnique({
  where: { userId }
});
const fullName = profile
  ? `${profile.firstName} ${profile.lastName}`
  : "Unknown";
```

---

## Rules to Enforce

### Rule 1: Profile is Cloud-Only

**Check:** Profile queries should NEVER include realmId

```typescript
// WRONG
await prisma.profile.findUnique({
  where: { userId, realmId }  // ❌ Profiles don't have realmId
});

// RIGHT
await prisma.profile.findUnique({
  where: { userId }
});
```

### Rule 2: Full Profile Requires Permission

**Check:** Any query returning externalAccounts must check viewFullProfile

```typescript
// Always verify before including externalAccounts
if (!canViewFullProfile) {
  throw new Error("Permission denied");
}
```

### Rule 3: Basic Profile is Cross-Realm

**Check:** Basic profile visible to anyone in any instance with user

```typescript
// User can see basic profile if both are in ANY common instance
const sharedInstances = await getSharedInstances(userId, viewerId);
if (sharedInstances.length === 0) {
  throw new Error("No shared instance");
}
```

---

## Test Cases

```typescript
describe("User Profiles", () => {
  it("should maintain single profile across federation", async () => {
    const user = await createUser(userId);
    const profile = await createProfile(userId, { firstName: "Alice" });

    // Query from cloud
    const cloudProfile = await getProfile(userId, "cloud");
    expect(cloudProfile.firstName).toBe("Alice");

    // Query from enterprise
    const enterpriseProfile = await getProfile(userId, "enterprise-acme");
    expect(enterpriseProfile.firstName).toBe("Alice");

    // Same object
    expect(cloudProfile.id).toBe(enterpriseProfile.id);
  });

  it("should hide full profile without permission", async () => {
    const profile = await createProfile(alice, {
      firstName: "Alice",
      cellPhone: "123456"
    });

    // Bob has no permission
    const visible = await getProfile(alice, bob, "cloud");
    expect(visible.cellPhone).toBeUndefined();
    expect(visible.firstName).toBe("Alice");
  });

  it("should show full profile with permission", async () => {
    // Grant Bob viewFullProfile on Alice
    await grantPermission(bob, "viewFullProfile", alice.id);

    const visible = await getProfile(alice, bob, "cloud");
    expect(visible.cellPhone).toBe("123456");
  });
});
```

---

## See Also

- Architecture: `architecture/00-federation-model.md` - Why profiles centralize
- Rules: `rules/00-realm-isolation.md` - Other models are realm-isolated
- Database: `database/00-realm-model.md` - Realm concept (profiles don't use realmId)
