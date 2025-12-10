---
purpose: "Specify the activity heatmap sheet design and behavior"
triggers: ["activity sheet", "heatmap", "user activity"]
keywords: ["heatmap", "sheet", "activity", "semester", "sticky"]
importance: "high"
size: "600 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

# Activity Sheets

## Sticky Heatmap Header
- Displays semester blocks (e.g., 2020 – 2024) with a **quick‑jump anchor** for each.
- Header remains fixed at the top of the sheet while the activity list scrolls (Audit 1.5).

## CTA Button
- In the profile view, the button reads **“Active between 2020 and 2024”** (Audit 1.1) and opens this sheet.

## Content Layout
- Below the heatmap, a vertical list of activity items grouped by semester.
- Each item shows an icon, timestamp, and brief description.

## Interaction Model
- No swipe gestures between heatmap and details (as per user request). Users scroll normally.
- Tapping an activity opens a **detail overlay** within the sheet (small modal, not full navigation).

## Optimistic Updates
- Actions such as “Mark as read” update instantly; a background sync persists changes.

## Accessibility
- Heatmap anchors are reachable via keyboard (`Tab` navigation) and have ARIA labels.

## Audit Integration
- Updated button text and removed swipe requirement.
- Sticky heatmap kept visible for easy navigation.
