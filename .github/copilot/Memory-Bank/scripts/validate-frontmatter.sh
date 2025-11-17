#!/bin/bash
# Script to validate and update frontmatter in memory bank files

echo "Memory Bank Frontmatter Validation Script"
echo "==========================================="
echo ""

BASE_DIR="/home/runner/work/pek-infinity/pek-infinity/.github/copilot/Memory-Bank"

# Required frontmatter fields
REQUIRED_FIELDS=("file" "purpose" "triggers" "keywords" "status")

# Optional but recommended fields
RECOMMENDED_FIELDS=("dependencies" "urgency" "size" "created" "updated" "mvp-scope" "phase")

echo "Checking all .md files in Memory Bank..."
echo ""

# Find all markdown files except README and scripts
find "$BASE_DIR" -name "*.md" -not -path "*/scripts/*" | while read -r file; do
  filename=$(basename "$file")
  relpath=${file#$BASE_DIR/}
  
  # Check if file has frontmatter
  if ! grep -q "^---$" "$file"; then
    echo "❌ $relpath: Missing frontmatter"
    continue
  fi
  
  # Extract frontmatter
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$file" | head -n -1 | tail -n +2)
  
  # Check required fields
  missing_fields=()
  for field in "${REQUIRED_FIELDS[@]}"; do
    if ! echo "$frontmatter" | grep -q "^$field:"; then
      missing_fields+=("$field")
    fi
  done
  
  # Check for mvp-scope field (recommended for MVP phase)
  has_mvp_scope=$(echo "$frontmatter" | grep -c "^mvp-scope:")
  
  if [ ${#missing_fields[@]} -gt 0 ]; then
    echo "⚠️  $relpath: Missing required fields: ${missing_fields[*]}"
  elif [ "$has_mvp_scope" -eq 0 ]; then
    echo "ℹ️  $relpath: Could benefit from mvp-scope field"
  else
    echo "✅ $relpath: OK"
  fi
done

echo ""
echo "Validation complete."
echo ""
echo "Recommended frontmatter format:"
echo "---"
echo "file: path/to/file.md"
echo "purpose: \"One-line summary\""
echo "triggers: [\"when to use\", \"what problem it solves\"]"
echo "keywords: [\"searchable\", \"terms\"]"
echo "dependencies: [\"other/files.md\"]"
echo "urgency: \"critical|high|medium|low\""
echo "size: \"word count\""
echo "status: \"active|archived|deprecated\""
echo "mvp-scope: \"current|future|mixed\""
echo "phase: \"MVP 1.0|Phase 1|Phase 2+\""
echo "created: \"YYYY-MM-DD\""
echo "updated: \"YYYY-MM-DD\""
echo "---"
