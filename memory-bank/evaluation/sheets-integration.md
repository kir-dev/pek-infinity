---
purpose: "Explain the sync with Google Sheets"
triggers: ["configuring sheets", "debugging sync"]
keywords: ["evaluation", "sheets", "google", "sync"]
importance: "probably needed"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Google Sheets Integration

We sync evaluation data with Google Sheets to allow flexible data entry.

## Mechanism
-   **Direction**: Two-way sync (or Read-only import, TBD).
-   **Mapping**: Columns in Sheets map to Categories in the database.
-   **Trigger**: Sync is triggered manually by the Group Leader or periodically via cron.

## Code Reference
-   *Implementation*: `full-stack/src/domains/evaluation/api/sheets.service.ts` (Pending implementation).
