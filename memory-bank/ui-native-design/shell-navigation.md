---
purpose: "Define the app shell and navigation patterns for the native design"
triggers: ["navigation design", "bottom bar", "sheet stack"]
keywords: ["shell", "navigation", "bottom bar", "sheets"]
importance: "critical"
size: "800 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"
---

# Shell & Navigation

## Bottom Bar Architecture
- Four tabs for regular users: **Home**, **Search**, **My Groups**, **Profile**.
- Fifth **Manage** tab appears only for users with leadership roles (hidden otherwise) to avoid illegal states.
- Persistent at the bottom 30% of the viewport, respecting safe‑area insets.

## Sheet vs. Navigation Rule
- **Sheet** for interactions that keep context visible (member details, activity heatmap, quick actions).  
- **Full navigation** (push route) when the view occupies >70% of the screen or requires deep hierarchy (e.g., Group Management).

## Scroll‑to‑Top on Tab Re‑tap
- Re‑tapping an active tab scrolls its main list to the top, providing a quick reset.

## No Header
- Each screen begins with a clear title element inside the content area to maintain identity without a global header.

## Audit Notes (integrated)
- The dynamic Manage tab may cause jarring UI shifts; we recommend an introductory tooltip when it first appears (Audit Item 3.5).  
- Sticky heatmap remains visible; no swipe between heatmap and details per user request (Audit Item 1.5).
