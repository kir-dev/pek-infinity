---
purpose: "Define member list filtering, sorting, and quick actions"
triggers: ["member list", "filter", "actions"]
keywords: ["members", "filter", "role", "state", "optimistic"]
importance: "high"
size: "800 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

# Members & Actions

## Filtering & Sorting
- **Search Input**: Live fuzzy search across member names.
- **Filter Chips**:
  - **Active** – shows only members with active status.
  - **Newbie** – shows only newcomers.
  - **Role…** – ellipsis opens a dropdown of all roles; selecting a role filters accordingly.
- **Default**: Active members sorted by role hierarchy (Leader > Admin > Member) (Audit 2.2).

## Virtualization
- For lists > 50 items, the UI uses virtualization to render only visible rows, preserving performance on mobile devices.

## Member Sheet Actions
- **Quick Actions** (displayed at top of the sheet):
  - **Change Role** – opens a role picker; on selection, shows a confirmation modal (“Change role to X?”) (Audit 2.3).
  - **Toggle State** – cycles through Newbie → Active → Passive → Former with a confirmation toast.
- **Optimistic Updates**: UI updates immediately; if the server rejects, a rollback toast appears.

## Accessibility
- All chips are keyboard‑navigable; ARIA labels communicate current filter state.

## Audit Integration
- Confirmation dialogs added for role/state changes.
- Virtualized list to address performance concerns for > 100 members (Audit 2.1).
- Default sorting aligns with design decisions.
