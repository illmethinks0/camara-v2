#!/bin/bash
#
# check_env.sh - Environment verification
# Pre-flight check before running gates
#

set -e

echo "========================================"
echo "Environment Check"
echo "========================================"

# Check Node.js
echo ""
echo "Node.js:"
if command -v node &> /dev/null; then
  node --version
else
  echo "❌ Node.js not found"
  exit 1
fi

# Check npm
echo ""
echo "npm:"
if command -v npm &> /dev/null; then
  npm --version
else
  echo "❌ npm not found"
  exit 1
fi

# Check git
echo ""
echo "Git:"
if command -v git &> /dev/null; then
  git --version
else
  echo "❌ Git not found"
  exit 1
fi

# Check bd (optional)
echo ""
echo "bd (beads) CLI:"
if command -v bd &> /dev/null; then
  bd version
else
  echo "⚠ bd not found (fallback mode will be used)"
fi

# Check essential files
echo ""
echo "Essential Files:"
FILES=(
  "docs/inputs_pack.md"
  "docs/spec_v1.md"
  "docs/evals.md"
  "docs/status.md"
  "docs/glossary.md"
)

ALL_PRESENT=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "❌ $file (missing)"
    ALL_PRESENT=false
  fi
done

# Check directories
echo ""
echo "Directories:"
DIRS=(
  "docs/adrs"
  "docs/waivers"
  "docs/blockers"
  "packages/contracts/api"
  "scripts"
  "evidence"
)

for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir"
  else
    echo "⚠ $dir (will be created)"
  fi
done

# Check package.json scripts (if exists)
if [ -f "package.json" ]; then
  echo ""
  echo "Package Scripts:"
  REQUIRED_SCRIPTS=("format:check" "lint" "typecheck" "test:unit" "build")
  for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run "$script" --silent &> /dev/null || grep -q "\"$script\":" package.json; then
      echo "✓ $script"
    else
      echo "⚠ $script (not defined)"
    fi
  done
fi

echo ""
echo "========================================"
if [ "$ALL_PRESENT" = true ]; then
  echo "✅ Environment check PASSED"
  exit 0
else
  echo "⚠ Environment check PASSED with warnings"
  exit 0
fi
