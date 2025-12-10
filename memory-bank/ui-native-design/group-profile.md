---
purpose: "Document the Group Profile layout and interactions"
triggers: ["group profile", "ui design", "member list"]
keywords: ["group", "profile", "layout", "members", "hierarchy"]
importance: "critical"
size: "1000 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

# Group Profile

## Layout Overview
- **Header**: Optional group logo, Group name, and a sticky **status banner** (e.g., “Archived”, “Inactive”, “Taskforce”) that stays visible when scrolling.
- **Leader Row**: Avatar + Name + **Edit** icon (opens a leader edit sheet). Highlighted to indicate leadership.
- **Sub‑Groups**: Inline list of child groups with right‑arrow indicators to show hierarchy.
- **Members Section**: Title “Members (100+)” followed by a **search input** and **filter chips**:
  - **Active** – filters active members.
  - **Newbie** – filters newcomers.
  - **Role…** – ellipsis opens a role dropdown; selecting a role filters accordingly.
  Default sorting is **Active → Role hierarchy** (Audit Item 2.2).

## Interaction Details
- **Member Row**: Avatar, Name, Role, Join year. Tapping opens a **member sheet**.
- **Member Sheet**: Contains quick actions:
  - **Change Role** – opens a role picker; selection triggers a confirmation modal (“Change role to X?”) (Audit Item 2.3).
  - **Toggle State** – cycles through Newbie → Active → Passive → Former with a confirmation toast.
- **Optimistic UI**: Immediate visual feedback; rollback on server error.
- **Filtering**: Chips filter locally; large lists (> 50) are virtualized for performance (Audit Item 2.1).
- **Breadcrumb**: Shows full hierarchy; truncated with ellipsis in the middle on narrow screens (business constraints limit depth, so minimal breadcrumb needed).

## Visual Consistency
- Uses the spacing and divider tokens defined in the tokens file.
- Icons from the Lucide set for edit, hierarchy arrows, and status indicators.

## Audit Integration
- Default filter set to Active, sorted by role hierarchy.
- Confirmation dialogs added for role/state changes.
- Sticky banner for special states included.
- No deep breadcrumb due to business constraints.
