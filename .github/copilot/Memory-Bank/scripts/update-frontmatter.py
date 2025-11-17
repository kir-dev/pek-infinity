#!/usr/bin/env python3
"""
Batch update frontmatter for memory bank files
Adds mvp-scope and phase fields to files that don't have them
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/home/runner/work/pek-infinity/pek-infinity/.github/copilot/Memory-Bank")

# Classification: mvp-scope -> (phase, files)
CLASSIFICATIONS = {
    "current": ("MVP 1.0", [
        "rules/01-auth-enforcement.md",
        "rules/02-service-purity.md",
        "rules/03-schema-validation.md",
        "rules/04-parent-validation.md",
        "gotchas/01-migration-blockers.md",
        "gotchas/02-performance-gotchas.md",
        "database/01-policy-system.md",
        "database/02-group-hierarchy.md",
        "architecture/01-auth-system.md",
        "architecture/02-service-patterns.md",
        "reference/03-glossary.md",
        "reference/04-quick-reference.md",
    ]),
    "future": ("Phase 1+ (Q2 2026+)", [
        "architecture/03-middleware-layering.md",
        "database/03-user-profile-federation.md",
        "decisions/00-mvp-vs-worker-instance.md",
        "decisions/01-future-roadmap.md",
        "rejected/00-rest-endpoints-in-mvp.md",
        "rejected/01-service-realm-awareness.md",
        "reference/00-request-flows.md",
        "reference/01-er-diagram.md",
        "reference/02-policy-examples.md",
    ]),
    "reference": ("All phases", [
        "README.md",
        "00-SYNTHETIC-MEMORY.md",
    ]),
}

def update_frontmatter(file_path: Path, mvp_scope: str, phase: str):
    """Add mvp-scope and phase to frontmatter if missing"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find frontmatter block
    match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        print(f"  ⚠️  No frontmatter found in {file_path.name}")
        return False
    
    frontmatter = match.group(1)
    
    # Check if already has mvp-scope
    if 'mvp-scope:' in frontmatter:
        print(f"  ⏭️  Already has mvp-scope: {file_path.name}")
        return False
    
    # Get the updated date if exists, otherwise use created date
    updated_match = re.search(r'updated:\s*["\']?(\d{4}-\d{2}-\d{2})', frontmatter)
    created_match = re.search(r'created:\s*["\']?(\d{4}-\d{2}-\d{2})', frontmatter)
    
    # Add fields before the closing ---
    new_fields = f'\nmvp-scope: "{mvp_scope}"\nphase: "{phase}"'
    
    # If there's an updated field, update it
    if updated_match:
        new_fields += f'\nupdated: "2025-11-17"'
        # Remove old updated line
        frontmatter = re.sub(r'\nupdated:.*', '', frontmatter)
    elif created_match:
        new_fields += f'\ncreated: "{created_match.group(1)}"\nupdated: "2025-11-17"'
    else:
        new_fields += '\ncreated: "2025-11-17"\nupdated: "2025-11-17"'
    
    # Remove empty lines at end of frontmatter
    frontmatter = frontmatter.rstrip()
    
    # Reconstruct content
    new_frontmatter = f"---\n{frontmatter}{new_fields}\n---"
    new_content = content.replace(match.group(0), new_frontmatter, 1)
    
    # Write back
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    print(f"  ✅ Updated: {file_path.name}")
    return True

def main():
    print("Memory Bank Frontmatter Update Script")
    print("=" * 50)
    print()
    
    total_updated = 0
    
    for mvp_scope, (phase, files) in CLASSIFICATIONS.items():
        print(f"\nProcessing {mvp_scope} files (phase: {phase}):")
        for rel_path in files:
            file_path = BASE_DIR / rel_path
            if not file_path.exists():
                print(f"  ⚠️  File not found: {rel_path}")
                continue
            
            if update_frontmatter(file_path, mvp_scope, phase):
                total_updated += 1
    
    print()
    print(f"Total files updated: {total_updated}")
    print()

if __name__ == "__main__":
    main()
