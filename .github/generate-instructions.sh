#!/bin/bash
set -exuo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory
cd "$SCRIPT_DIR"

# Generate copilot-instructions.md
cat > copilot-instructions.md << 'EOF'
<!-- this is auto generated, do not edit manually -->
<memory-bank>
EOF

pushd "$SCRIPT_DIR/../"
head -n 15 memory-bank/**/*.md >> "$SCRIPT_DIR/copilot-instructions.md"
popd

cat >> copilot-instructions.md << 'EOF'
</memory-bank>
EOF

cat .copilot-instructions.template.md >> copilot-instructions.md

