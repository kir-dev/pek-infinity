---
file: reference/02-policy-examples.md
purpose: "Real-world policy hierarchy examples: Schönherz, conference, deep nesting"
triggers: ["designing policy structure", "understanding escalation", "testing policy system"]
keywords: ["policy", "example", "hierarchy", "escalation", "schönherz", "conference", "real-world"]
dependencies: ["database/01-policy-system.md", "database/02-group-hierarchy.md"]
urgency: "low"
size: "1000 words"
sections: ["schönherz-hierarchy", "conference-hierarchy", "deep-nesting", "cascading-examples", "permission-matrix"]
status: "active"
mvp-scope: "future"
phase: "Phase 1+ (Q2 2026+)"
created: "2025-11-17"
updated: "2025-11-17"
---

# Reference: Real-World Policy Examples

## Example 1: Schönherz College Hierarchy

### Organizational Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    Schönherz College                            │
│                                                                 │
│  Elnök (President)                                              │
│  └─ Policy: SIMONYI_ELNOK (supreme permissions)                 │
│     Statements:                                                 │
│     - canViewAllMembers: true                                   │
│     - canEditMembers: true                                      │
│     - canIssuePolicy: true                                      │
│     - canDeleteGroup: true                                      │
│     - canEscalate: true                                         │
│                                                                 │
│  ├─ Board (Testület)                                            │
│  │  └─ Policy: BOARD_MEMBER                                     │
│  │     Statements:                                              │
│  │     - canViewMembers: true (board scope)                     │
│  │     - canEditMembers: true (manage board)                    │
│  │     - canCreateSubgroup: true                                │
│  │     - escalatedFrom: Elnök (inherits...)                     │
│  │                                                              │
│  │  ├─ Internal Affairs (Belügyek)                              │
│  │  │  └─ Policy: BELUGYEK_HEAD                                 │
│  │  │     (manages internal processes)                          │
│  │  │                                                           │
│  │  ├─ Finances (Pénzügyek)                                     │
│  │  │  └─ Policy: PENZUGYEK_HEAD                                │
│  │  │     (manages budget)                                      │
│  │  │                                                           │
│  │  └─ Human Resources (Emberi Erőforrások)                     │
│  │     └─ Policy: HR_HEAD                                       │
│  │        (manages staff)                                       │
│  │                                                              │
│  └─ Committees (Bizottságok)                                    │
│     ├─ Education Committee                                      │
│     │  └─ Policy: EDU_COMMITTEE_MEMBER                          │
│     │     - canViewMembers (edu scope)                          │
│     │     - canReview: true                                     │
│     │                                                           │
│     ├─ Events Committee                                         │
│     │  └─ Policy: EVENTS_COMMITTEE_MEMBER                       │
│     │                                                           │
│     └─ Environment Committee                                    │
│        └─ Policy: ENV_COMMITTEE_MEMBER                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

User Journey Example:
- Alice = Elnök (President)
  Policies: [SIMONYI_ELNOK]
  Permissions: All permissions at all levels

- Bob = Board Member + Finances Head
  Policies: [BOARD_MEMBER, PENZUGYEK_HEAD]
  Permissions: 
    - From BOARD_MEMBER: canViewMembers (board scope)
    - From PENZUGYEK_HEAD: canEditMembers (finances scope)

- Carol = Education Committee Member
  Policies: [EDU_COMMITTEE_MEMBER]
  Permissions: canViewMembers (education scope), canReview

- Dave = HR Staff (new member)
  Policies: None
  Permissions: Only view their own profile
```

---

## Example 2: Conference Management Hierarchy

### Multi-Level Event Structure

```
┌─────────────────────────────────────────────────────────────────┐
│     ITConf 2025 (Conference, realmId='conf-2025')               │
│                                                                 │
│  Conference Director                                            │
│  └─ Policy: CONF_DIRECTOR                                       │
│     - canViewAll: true                                          │
│     - canEditSchedule: true                                     │
│     - canManageStaff: true                                      │
│                                                                 │
│  ├─ Program Track (AI/ML)                                       │
│  │  └─ Policy: TRACK_LEAD                                       │
│  │     - canViewMembers (AI/ML track only)                      │
│  │     - canSelectSpeakers: true                                │
│  │     - canEditTrack: true                                     │
│  │     (Escalation from CONF_DIRECTOR: gets moveGroupOwner)     │
│  │                                                              │
│  │  ├─ Session 1: AI Fundamentals                               │
│  │  │  └─ Policy: SESSION_CHAIR                                 │
│  │  │     - canModerate: true                                   │
│  │  │     - canAddSpeaker: true                                 │
│  │  │     (Escalation from TRACK_LEAD: gets session mgmt)       │
│  │  │                                                           │
│  │  └─ Session 2: Deep Learning                                 │
│  │     └─ Policy: SESSION_CHAIR                                 │
│  │                                                              │
│  ├─ Program Track (Security)                                    │
│  │  └─ Policy: TRACK_LEAD                                       │
│  │     (same as AI/ML track)                                    │
│  │                                                              │
│  └─ Operations                                                  │
│     ├─ Venue & Logistics                                        │
│     │  └─ Policy: LOGISTICS_LEAD                                │
│     │     - canEditVenue: true                                  │
│     │     - canManageCatering: true                             │
│     │                                                           │
│     ├─ Marketing & Sponsorship                                  │
│     │  └─ Policy: MARKETING_LEAD                                │
│     │                                                           │
│     └─ Finance & Registration                                   │
│        └─ Policy: FINANCE_LEAD                                  │
│           - canEditBudget: true                                 │
│           - canIssueRefund: true                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Escalation Chain Example:
CONF_DIRECTOR creates AI/ML Track
  → AI/ML Track Lead gets escalated: canMoveTrack (move it in hierarchy)
  
AI/ML Track Lead creates Session 1
  → Session Chair gets escalated: canMoveSession (move session in track)
  
Result: Permission pyramid
- Conference Director: manage all
- Track Leads: manage own track + escalated from director
- Session Chairs: manage own session + escalated from track lead

This allows each level to delegate without admin rights!
```

---

## Example 3: Deep Nesting (Departments in Organization)

### Organizational Hierarchy with 5 Levels

```
┌─────────────────────────────────────────────────────────┐
│            Company (L0)                                 │
│            realmId: 'org-2025'                          │
│                                                         │
│  ├─ Engineering (L1)                                    │
│  │  ├─ Backend Team (L2)                                │
│  │  │  ├─ Database Specialists (L3)                     │
│  │  │  │  └─ PostgreSQL Group (L4)                      │
│  │  │  │     └─ PostgreSQL Optimization (L5)            │
│  │  │  │        └─ Query Tuning Subgroup (L6)           │
│  │  │  │           (Max nesting, avoid deeper!)         │
│  │  │  │                                                │
│  │  │  └─ API Development (L3)                          │
│  │  │                                                   │
│  │  └─ Frontend Team (L2)                               │
│  │     ├─ React Specialists (L3)                        │
│  │     └─ Vue Specialists (L3)                          │
│  │                                                      │
│  └─ Product (L1)                                        │
│     ├─ Product Management (L2)                          │
│     └─ Research (L2)                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘

Problems at Deep Nesting (L5+):
1. Query complexity: N-level hierarchy traversal
2. Permission inheritance: Track all escalations up 6 levels
3. Cascading operations: Archive L0 cascades to 6 levels
4. Circular reference risk: Hard to detect cycles at depth

Prevention:
✓ Max nesting: 5 levels (query time O(5) instead of O(n))
✓ Flatten when possible (create sibling instead of nested)
✓ Use policy escalation for delegation (not deep nesting)
✓ Test circular detection at 5+ levels
```

---

## Cascading Permission Example

### Scenario: Create New Department

```
ACTION: Create "Engineering" department under "Company"

BEFORE CASCADE:
┌─────────────────────────┐
│ Company                 │
│ realmId: 'org-2025'     │
│ Members:                │
│ - Alice (COMPANY_CEO)   │
│ - Bob (COMPANY_BOARD)   │
│ - Carol (COMPANY_STAFF) │
│                         │
│ Policies:              │
│ - COMPANY_CEO          │
│   canEditAll: true     │
│   canCreateDept: true  │
│ - COMPANY_BOARD        │
│   canViewMembers: true │
│   canCreateDept: true  │
│   (escalated)          │
└─────────────────────────┘

ACTION: Alice creates "Engineering" group
────────────────────────────────────────

CREATE Group {
  id: 'eng',
  parentId: 'company',
  realmId: 'org-2025',
  name: 'Engineering'
}

TRIGGER CASCADE:

1. Find all managers of parent (Company):
   Query: WHERE groupId = 'company' AND policy.canManageGroup = true
   Result: [Alice (COMPANY_CEO), Bob (COMPANY_BOARD)]

2. For each manager, add escalation statement:
   INSERT Statement {
     policyId: alice_policy.id,
     statementId: escalation_move_eng,
     canMoveGroup: true,
     escalatedFrom: 'company'
   }
   INSERT Statement {
     policyId: bob_policy.id,
     statementId: escalation_move_eng,
     canMoveGroup: true,
     escalatedFrom: 'company'
   }

AFTER CASCADE:
┌─────────────────────────┐
│ Engineering (NEW)       │
│ realmId: 'org-2025'     │
│ parentId: 'company'     │
│ Members: (empty)        │
│                         │
│ Managers (inherited):   │
│ - Alice (can moveGroup) │ ← Escalated!
│ - Bob (can moveGroup)   │ ← Escalated!
│                         │
│ (Now Alice & Bob can    │
│  move Engineering       │
│  without editMembers)   │
└─────────────────────────┘

PERMISSION RESULT:
- Alice: canCreateDept (from COMPANY_CEO)
         + canMoveGroup (escalated)
         + canEditAll (inherits all)
         
- Bob: canCreateDept (from COMPANY_BOARD)
       + canMoveGroup (escalated)

Why useful?
- Bob can move Engineering around without having editMembers
- Allows delegation of structural decisions (not personnel)
- Prevents permission accumulation (can moveGroup, nothing else)
```

---

## Permission Matrix Example

### What Can Each Role Do?

```
┌────────────────────────────────────────────────────────────────┐
│            PERMISSION MATRIX: Schönherz Case                   │
├────────────────────────────────────────────────────────────────┤
│ Permission              │ Elnök │ Board │ Dept Head │ Member   │
├────────────────────────────────────────────────────────────────┤
│ View college members    │ ✓     │ ✓     │ Scoped    │ ✗        │
│ Edit member list        │ ✓     │ ✓     │ Scoped    │ ✗        │
│ Create subgroup         │ ✓     │ ✓     │ ✓         │ ✗        │
│ Move groups             │ ✓     │ ✓     │ ✓*        │ ✗        │
│ Delete group            │ ✓     │ ✗     │ ✗         │ ✗        │
│ Issue policy            │ ✓     │ ✗     │ ✗         │ ✗        │
│ Archive                 │ ✓     │ ✓     │ Scoped    │ ✗        │
│ View score              │ ✓     │ ✓     │ Scoped    │ Own      │
│ Evaluate score          │ ✓     │ ✓     │ Scoped    │ ✗        │
│ Issue award             │ ✓     │ Scoped│ ✗         │ ✗        │
├────────────────────────────────────────────────────────────────┤
│ * Escalated from Elnök (can move without editMembers)          │
│ Scoped = restricted to own department/group                    │
└────────────────────────────────────────────────────────────────┘
```

---

## Testing Policy Cascades

### Test Case: Create Nested Groups

```typescript
describe('Policy Cascading', () => {
  it('should grant escalated permissions when creating subgroup', async () => {
    // Setup
    const realm = await createRealm();
    const parent = await createGroup({ realmId: realm.id });
    const manager = await createUser({ realmId: realm.id });
    const policy = await createPolicy({ canEditMembers: true });
    
    await addMembership(parent, manager, policy);
    
    // Action: Create subgroup
    const child = await createGroup({
      realmId: realm.id,
      parentId: parent.id,
    });
    
    // Assert: Manager has escalated permissions
    const statements = await getStatements(manager, policy);
    
    expect(statements).toContainEqual({
      canMoveGroup: true,
      escalatedFrom: parent.id,
    });
    
    // Assert: Manager can move child without editMembers
    expect(() =>
      moveGroup(child, manager, { from: parent, to: newParent })
    ).not.toThrow();
  });
});
```

