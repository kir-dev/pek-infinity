---
purpose: "Manage group memberships"
triggers: ["joining group", "leaving group", "approving members"]
keywords: ["membership", "join", "leave", "approval"]
importance: "must know"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Membership Management

Membership connects Users to Groups.

## Flows
1.  **Join Request**: User requests to join a group.
2.  **Approval**: Group Leader approves or rejects the request.
3.  **Direct Add**: Group Leader can directly add a user (if they have the user's ID).
4.  **Leave**: User can leave a group at any time.

## Roles
Membership also stores the user's role within that specific group (e.g., "Member", "Newbie").

## Code Reference
-   *Implementation*: `full-stack/src/domains/membership/api/membership.service.ts` (Pending implementation).
