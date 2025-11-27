#!/bin/bash
set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory
cd "$SCRIPT_DIR"

# Generate copilot-instructions.md
cat > copilot-instructions.md << 'EOF'
<!-- this is auto generated, do not edit manually -->
<memory-bank>
EOF

head -n 15 "$SCRIPT_DIR"/../memory-bank/**/*.md >> copilot-instructions.md

cat >> copilot-instructions.md << 'EOF'
</memory-bank>
EOF

cat .copilot-instructions.template.md >> copilot-instructions.md

