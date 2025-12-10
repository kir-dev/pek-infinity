---
purpose: "Define spacing and sizing tokens and visual systems"
triggers: ["styling components", "adjusting layout", "design system updates"]
keywords: ["tokens", "spacing", "sizing", "visuals", "tailwind"]
importance: "must know"
size: "500 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

# Spacing and Sizing Systems

## 1. THE SPACING SYSTEM (Relationships: Padding, Margin, Gap)

This system is for controlling the space between elements. We strictly use the Tailwind scale based on your company's desired rhythm (4px, 6px, 8px, 12px, 16px, 20px).

| Semantic Job | Tailwind Class | Value (px) | Company Value (px) | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| Micro Gap | p-1 / gap-1 | 4px | 4px | Tightest alignment. Required for icon and text in a compact label or tag. |
| Subtle Gap | gap-1.5 | 6px | 6px | Used for spacing small, related elements where 8px is too loose (e.g., small status indicators). |
| Inline Gap | p-2 / gap-2 | 8px | 8px | Standard horizontal space between an icon and a primary label, or closely related buttons. |
| Item Gap | p-3 / gap-3 | 12px | 12px | Vertical separation within a component (e.g., Title from Description). Standard padding for small components. |
| Group Gap | p-4 / gap-4 | 16px | 16px | The Default. Vertical/Horizontal separation between items in a list, table rows, or distinct groups. |
| Section Gap | p-5 / gap-5 | 20px | 20px | Major separation between content blocks or primary sections on a page. |
| Card Padding | p-6 / m-6 | 24px | 24px | Standard Padding inside any white or colored content box/card. |
| Panel Padding | p-8 / m-8 | 32px | 32px | Padding inside large containers like sidebars, modals, and slide-over panels. |
| Page Padding | p-10 / m-10 | 40px | 40px | Padding for the main viewport edge-to-edge content. |

## 2. THE SIZING SYSTEM (Component Dimensions)

This system is for setting fixed width (w-*), height (h-*), and size (size-*) for structural components like Avatars, Inputs, and Icons. It directly maps to your 8, 16, 24... scale.

| Semantic Size | Tailwind Class | Value (px) | Company Value (px) | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| Size-XS | size-2 | 8px | 8px | Tiny status dots, small badges. |
| Size-SM | size-4 | 16px | 16px | Standard Icon Size (e.g., Lucide icons inside a button). |
| Size-MD | size-6 | 24px | 24px | Small Avatar (3x3 grid), standard checkbox/radio size. |
| Size-LG | size-8 | 32px | 32px | Medium Avatar, large touch targets (mobile only). |
