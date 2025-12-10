---
purpose: "Document the User Profile layout and interactions"
triggers: ["user profile", "ui design", "contact icons"]
keywords: ["user", "profile", "layout", "contacts", "heatmap"]
importance: "critical"
size: "900 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

# User Profile

## Layout Overview
- **Top Section**: Avatar (large), Name, Title, Status badge.
- **Contact Row**: Icons for Email, Facebook, Instagram, WhatsApp, Phone. Each icon reveals a tooltip on hover (desktop) or long‑press (mobile) with the actual contact value (Audit Item 1.2).
- **Groups Section**: “Groups” heading followed by a horizontal scroll of group chips (up to 10). The first chip is a **“Create Group”** action (plus sign) for quick entry.
- **Activity Sheet Trigger**: A button labeled **“Active between 2020 and 2024”** opens the sticky heatmap sheet (Audit Item 1.1). The sheet shows semester blocks with quick‑jump anchors.

## Interaction Details
- **Edit Button**: Located top‑right, opens a full‑screen edit view (`/profile/edit`). No conflict with safe‑area.
- **Heatmap Sheet**: Sticky header stays visible while scrolling the activity list; users can scroll without needing swipe gestures (Audit Item 1.5).
- **Accessibility**: Icons are keyboard‑focusable; tooltips appear on focus.

## Audit Integration
- Added explicit tooltip/long‑press labels for contacts.
- Updated activity button text per user request.
- Confirmed no swipe between heatmap and details; sticky heatmap remains on top.
