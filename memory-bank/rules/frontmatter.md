---
purpose: "Enforce frontmatter format"
triggers: ["creating documentation", "updating docs"]
keywords: ["frontmatter", "format", "rules"]
importance: "must know"
size: "100 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Frontmatter Format

Frontmatter is used as an index for searching documentation. The first 15 lines are converted to vector embeddings without parsing the YAML.
All documentation files must start with exactly 15 lines of frontmatter.

## Template
```yaml
---
purpose: "Short description of the file"
triggers: ["when to read this"]
keywords: ["keywords", "for", "search"]
importance: "must know" | "probably needed" | "nice to know" | "archive" | "deprecated" | "something else, freetext"
size: "approx tokens or words. Round to nearest 100."
status: "active"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"





---
```
