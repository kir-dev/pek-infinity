---
purpose: "Define the design philosophy shift from Bootstrap Admin to Native/Linear"
triggers: ["UI refactor", "design review", "component updates"]
keywords: ["design", "native", "linear", "phonebook", "search-first"]
importance: "critical"
size: "1500 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"
---

# Design Vision: Bootstrap Admin → Native/Linear

## The Shift

We are moving from a "Bootstrap Admin Page" aesthetic (card-based, boxed containers) to a "Native/Linear" design (content-first, whitespace-driven, gesture-based).

This is a **fundamental architecture change**, not cosmetic.

## Core Principles

### 1. Invisible Structures
- **Kill the card metaphor**: No rounded boxes with shadows on generic backgrounds
- **Use whitespace & negative space** to organize data
- **1px dividers** between logical sections (not containers)
- Content defines the interface, not chrome

### 2. Thumb-Zone Supremacy
- Navigation and primary actions live in **bottom 30%** (OneUI principle)
- Reachability is mandatory — users shouldn't hunt
- Bottom bar is persistent, always accessible
- Content scrolls; controls don't

### 3. Death to Hamburger Menu
- No off-canvas navigation
- Use **persistent bottom bars** + **stackable sheets**
- Context is always visible
- Navigation is friction-free

### 4. Content is the Interface
- Reduce button clutter
- If data can be tapped/swiped directly, do it
- Don't add a "View" button when the row itself should be interactive
- Rows are actionable by default

### 5. Optimistic Physics
- UI reacts **instantly** to touch
- Data syncs in the background
- Never show a spinner for simple toggles (Revolut pattern)
- Feedback is tactile and present

### 6. Tactile Precision
- High-density information without visual chaos
- Rigorous alignment creates order
- Gesture states (swipe, drag) are distinct
- Micro-interactions soften professional rigidity

### 7. Sheets Over Modals
- Avoid center-screen popups (jarring, takes focus)
- Complex interactions happen in **slide-up panels**
- Sheets preserve context — you see the background
- Sheets are dismissible by gesture

### 8. Humanized Micro-interactions
- Hover/active states feel responsive
- Don't just change color — add weight, scale, or movement
- Feedback should feel intentional, not mechanical

### 9. Native Fluidity
- Eliminate "white flash" routing artifacts
- App behaves like a **single living organism**
- Transitions are smooth, content feels connected
- No page reloads — state flows between screens

## Core Use Case: Search-First Phonebook

**Users**: 10,000+ people across 100+ groups
**User's context**: 3-10 groups on average
**Primary actions**:
1. Search for a user by name
2. Search for a group by name
3. View user profile with their groups
4. View group profile with hierarchy, leader, metadata

**Design consequence**: 
- Search is a **core navigation element**, not a buried feature
- User & Group profiles are equally important
- Membership is an **entity** (not just a join table)

## Memory Bank Structure

This folder contains:
- `vision.md` (this file) — Philosophy & principles
- `shell-navigation.md` — App shell and navigation patterns
- `user-profile.md` — User Profile layout and interactions
- `group-profile.md` — Group Profile layout and interactions
- `members-and-actions.md` — Group members list, filtering, and quick actions
- `activity-sheets.md` — User activity sheet design
- `tokens-and-visuals.md` — Design tokens, typography, spacing, iconography
- `todos-home-search-manage.md` — Placeholders for remaining major screens

## Conversion Rules: From Bootstrap → Native

| Bootstrap | Native | Rationale |
|-----------|--------|-----------|
| Card containers | Whitespace + dividers | Content breathes |
| Modal popups | Bottom sheets | Context preserved |
| Hamburger menu | Bottom nav | Reachability |
| Button-heavy UI | Row-based actions | Simplicity |
| Page reloads | Sheet overlays | Continuity |
| Shadows & borders | Subtle dividers | Minimal chrome |
| "View" buttons | Tap row directly | Content-first |
| Spinners on interactions | Optimistic updates | Responsive feel |
