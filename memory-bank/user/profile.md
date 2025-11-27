---
purpose: "User and Profile models; single profile in hub across federation, privacy scope restrictions"
triggers: ["implementing user queries", "designing profile access", "handling federated users", "privacy boundaries"]
keywords: ["user", "profile", "federation", "privacy", "scope", "basic-profile", "full-profile", "external-account"]
importance: "high"
size: "500 tokens"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

# User Profile

## Core Concept

**Critical difference from other models:**

- **Groups, Policies, Scoreboards, etc.**: Exist per instance/realm (Groups in hub are different from groups in worker-acme)
- **Users and Profiles**: **Centralized in hub instance**—single source of truth across entire federation

A federated user (member of both hub AND worker-acme) has ONE profile in hub, but policies/memberships in both instances.

## Schema Models

### User Model

### Profile Model

**⚠️ CRITICAL:** Profile has NO `realmId` field. Profiles exist in hub only, shared across federation.

## Privacy Scoping: Basic vs Full Profile

### Basic Profile Scope

**Who can see this?** Anyone in any instance the user is in (allowlist only)

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

## Common Mistakes

### ❌ WRONG: Creating multiple profiles per user

```typescript
// WRONG: Creates profile in each instance
const profile = await prisma.profile.create({
  data: { userId, firstName, realmId: realm }
});

// RIGHT: Single profile in hub
const profile = await prisma.profile.create({
  data: { userId, firstName }
  // NO realmId - profiles are global
});
```

### ❌ WRONG: Not checking full profile permission
