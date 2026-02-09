#!/bin/bash
#
# gates.sh - Automated Verification Script
# Single source of truth for all quality gates
#

set -e

# Configuration
EVIDENCE_DIR="evidence/iteration-$(date +%Y%m%d-%H%M%S)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
TIER="prototype"  # prototype | production | regulated
FALLBACK_MODE=false

# Gate results
GATES_PASSED=0
GATES_FAILED=0
TOTAL_GATES=0

# Create evidence directory
mkdir -p "$EVIDENCE_DIR"

# Output helpers
log() {
  echo "[$(date +%H:%M:%S)] $1" | tee -a "$EVIDENCE_DIR/gates.log"
}

pass() {
  echo "✅ PASS: $1" | tee -a "$EVIDENCE_DIR/gates.log"
  ((GATES_PASSED++))
  ((TOTAL_GATES++))
}

fail() {
  echo "❌ FAIL: $1" | tee -a "$EVIDENCE_DIR/gates.log"
  ((GATES_FAILED++))
  ((TOTAL_GATES++))
}

skip() {
  echo "⏭️  SKIP: $1" | tee -a "$EVIDENCE_DIR/gates.log"
  ((TOTAL_GATES++))
}

# Pre-flight checks
log "========================================"
log "Gates.sh - Automated Verification"
log "Timestamp: $TIMESTAMP"
log "Commit: $COMMIT_HASH"
log "Tier: $TIER"
log "Evidence: $EVIDENCE_DIR"
log "========================================"

# Check if bd is available
if command -v bd &> /dev/null; then
  log "✓ bd CLI available"
  FALLBACK_MODE=false
else
  log "⚠ bd CLI not available - using fallback mode"
  FALLBACK_MODE=true
fi

echo "fallback_mode: $FALLBACK_MODE" >> "$EVIDENCE_DIR/meta.json"

# Run pre-flight
log ""
log "--- PRE-FLIGHT ---"
if [ -f "scripts/check_env.sh" ]; then
  if bash scripts/check_env.sh >> "$EVIDENCE_DIR/preflight.log" 2>&1; then
    pass "Environment check"
  else
    fail "Environment check"
  fi
else
  skip "Environment check (script not found)"
fi

# Static checks
log ""
log "--- STATIC CHECKS ---"

# Format check
if [ -f "package.json" ] && npm run format:check --silent 2>/dev/null; then
  if npm run format:check >> "$EVIDENCE_DIR/format.log" 2>&1; then
    pass "Format check"
  else
    fail "Format check"
  fi
else
  skip "Format check (not configured)"
fi

# Lint - Backend
if [ -f "packages/backend/package.json" ]; then
  if npm run lint --workspace=packages/backend >> "$EVIDENCE_DIR/lint-backend.log" 2>&1; then
    pass "Lint check (backend)"
  else
    fail "Lint check (backend)"
  fi
else
  skip "Lint check (backend)"
fi

# Lint - Frontend
if [ -f "packages/frontend/package.json" ]; then
  if npm run lint --workspace=packages/frontend >> "$EVIDENCE_DIR/lint-frontend.log" 2>&1; then
    pass "Lint check (frontend)"
  else
    fail "Lint check (frontend)"
  fi
else
  skip "Lint check (frontend)"
fi

# Type check - Backend
if [ -f "packages/backend/package.json" ]; then
  if npm run typecheck --workspace=packages/backend >> "$EVIDENCE_DIR/typecheck-backend.log" 2>&1; then
    pass "Type check (backend)"
  else
    fail "Type check (backend)"
  fi
else
  skip "Type check (backend)"
fi

# Type check - Frontend
if [ -f "packages/frontend/package.json" ]; then
  if npm run typecheck --workspace=packages/frontend >> "$EVIDENCE_DIR/typecheck-frontend.log" 2>&1; then
    pass "Type check (frontend)"
  else
    fail "Type check (frontend)"
  fi
else
  skip "Type check (frontend)"
fi

# Tests
log ""
log "--- TESTS ---"

# Unit tests - Backend
if [ -f "packages/backend/package.json" ]; then
  if npm run test:unit --workspace=packages/backend >> "$EVIDENCE_DIR/unit-tests-backend.log" 2>&1; then
    pass "Unit tests (backend)"
  else
    fail "Unit tests (backend)"
  fi
else
  skip "Unit tests (backend)"
fi

# Unit tests - Frontend
if [ -f "packages/frontend/package.json" ]; then
  if npm run test --workspace=packages/frontend >> "$EVIDENCE_DIR/unit-tests-frontend.log" 2>&1; then
    pass "Unit tests (frontend)"
  else
    fail "Unit tests (frontend)"
  fi
else
  skip "Unit tests (frontend)"
fi

# Integration tests (production+)
if [ "$TIER" != "prototype" ]; then
  if [ -f "package.json" ]; then
    if npm run test:integration >> "$EVIDENCE_DIR/integration-tests.log" 2>&1; then
      pass "Integration tests"
    else
      fail "Integration tests"
    fi
  else
    skip "Integration tests (no package.json)"
  fi
else
  skip "Integration tests (prototype tier)"
fi

# Contract tests (production+)
if [ "$TIER" != "prototype" ]; then
  if [ -f "package.json" ]; then
    if npm run test:contracts >> "$EVIDENCE_DIR/contract-tests.log" 2>&1; then
      pass "Contract tests"
    else
      fail "Contract tests"
    fi
  else
    skip "Contract tests (no package.json)"
  fi
else
  skip "Contract tests (prototype tier)"
fi

# Safety checks
log ""
log "--- SAFETY CHECKS ---"

# Secrets scan
if command -v detect-secrets &> /dev/null; then
  if detect-secrets scan >> "$EVIDENCE_DIR/secrets.log" 2>&1; then
    pass "Secrets scan"
  else
    fail "Secrets scan"
  fi
else
  skip "Secrets scan (detect-secrets not installed)"
fi

# Dependency audit
if [ -f "package.json" ]; then
  if npm audit --audit-level=high >> "$EVIDENCE_DIR/audit.log" 2>&1; then
    pass "Dependency audit"
  else
    fail "Dependency audit"
  fi
else
  skip "Dependency audit (no package.json)"
fi

# Contract drift check
log ""
log "--- CONTRACT DRIFT ---"

CONTRACTS_CHANGED=false
if [ -d "packages/contracts" ]; then
  if git diff --name-only HEAD | grep -q "packages/contracts"; then
    CONTRACTS_CHANGED=true
  fi
fi

if [ "$CONTRACTS_CHANGED" = true ]; then
  log "Contracts changed - checking for updates..."
  
  # Check if tests updated
  if git diff --name-only HEAD | grep -q "packages/contracts/test"; then
    pass "Contract tests updated"
  else
    fail "Contract tests NOT updated (drift detected)"
  fi
  
  # Check if spec updated
  if git diff --name-only HEAD | grep -q "docs/spec_v1.md"; then
    pass "Spec updated"
  else
    fail "Spec NOT updated (drift detected)"
  fi
else
  skip "Contract drift check (no contract changes)"
fi

# Diff size check
log ""
log "--- DIFF SIZE ---"

DIFF_SIZE_LIMIT=800  # prototype default
if [ "$TIER" = "production" ]; then
  DIFF_SIZE_LIMIT=400
elif [ "$TIER" = "regulated" ]; then
  DIFF_SIZE_LIMIT=200
fi

# Check for waiver
if ls docs/waivers/WVR-*.md 1> /dev/null 2>&1; then
  log "Waiver found - skipping diff size check"
  skip "Diff size check (waiver active)"
else
  DIFF_SIZE=$(git diff --stat HEAD | tail -1 | awk '{print $4}')
  if [ -z "$DIFF_SIZE" ]; then
    DIFF_SIZE=0
  fi
  
  echo "diff_size: $DIFF_SIZE" >> "$EVIDENCE_DIR/meta.json"
  echo "diff_limit: $DIFF_SIZE_LIMIT" >> "$EVIDENCE_DIR/meta.json"
  
  if [ "$DIFF_SIZE" -le "$DIFF_SIZE_LIMIT" ]; then
    pass "Diff size ($DIFF_SIZE <= $DIFF_SIZE_LIMIT)"
  else
    fail "Diff size ($DIFF_SIZE > $DIFF_SIZE_LIMIT)"
  fi
fi

# Approvals check
log ""
log "--- APPROVALS ---"

LOCKFILE_CHANGED=false
if git diff --name-only HEAD | grep -E "(package-lock.json|yarn.lock|pnpm-lock.yaml)" > /dev/null; then
  LOCKFILE_CHANGED=true
fi

SCHEMA_CHANGED=false
if git diff --name-only HEAD | grep -E "(prisma/schema.prisma|migrations/)" > /dev/null; then
  SCHEMA_CHANGED=true
fi

if [ "$LOCKFILE_CHANGED" = true ] || [ "$SCHEMA_CHANGED" = true ]; then
  if [ -f "docs/approvals.md" ]; then
    if grep -q "APPROVAL-" docs/approvals.md; then
      pass "Approvals documented"
    else
      fail "Lockfile/schema changed but no approvals found"
    fi
  else
    fail "Lockfile/schema changed but approvals.md missing"
  fi
else
  skip "Approvals check (no lockfile/schema changes)"
fi

# Build check
log ""
log "--- BUILD ---"

# Build backend
if [ -f "packages/backend/package.json" ]; then
  if npm run build --workspace=packages/backend >> "$EVIDENCE_DIR/build-backend.log" 2>&1; then
    pass "Build (backend)"
  else
    fail "Build (backend)"
  fi
else
  skip "Build (backend)"
fi

# Build frontend
if [ -f "packages/frontend/package.json" ]; then
  if npm run build --workspace=packages/frontend >> "$EVIDENCE_DIR/build-frontend.log" 2>&1; then
    pass "Build (frontend)"
  else
    fail "Build (frontend)"
  fi
else
  skip "Build (frontend)"
fi

# Smoke test
log ""
log "--- SMOKE TEST ---"

if [ -f "package.json" ]; then
  # Start server in background
  if npm start &
  then
    SERVER_PID=$!
    sleep 5
    
    # Health check
    if curl -f http://localhost:3000/health >> "$EVIDENCE_DIR/smoke.log" 2>&1; then
      pass "Health check"
    else
      fail "Health check"
    fi
    
    # Cleanup
    kill $SERVER_PID 2>/dev/null || true
  else
    skip "Smoke test (could not start server)"
  fi
else
  skip "Smoke test (no package.json)"
fi

# Generate summary
log ""
log "========================================"
log "SUMMARY"
log "========================================"
log "Total Gates: $TOTAL_GATES"
log "Passed: $GATES_PASSED"
log "Failed: $GATES_FAILED"
log ""

# Write evidence pack
cat > "$EVIDENCE_DIR/summary.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "commit": "$COMMIT_HASH",
  "tier": "$TIER",
  "fallback_mode": $FALLBACK_MODE,
  "total_gates": $TOTAL_GATES,
  "passed": $GATES_PASSED,
  "failed": $GATES_FAILED,
  "success_rate": $(echo "scale=2; $GATES_PASSED / $TOTAL_GATES * 100" | bc 2>/dev/null || echo "N/A"),
  "lkgc_eligible": $(if [ $GATES_FAILED -eq 0 ]; then echo "true"; else echo "false"; fi),
  "green_streak": 0
}
EOF

if [ $GATES_FAILED -eq 0 ]; then
  log "✅ ALL GATES PASSED"
  log "Evidence: $EVIDENCE_DIR"
  exit 0
else
  log "❌ SOME GATES FAILED"
  log "Evidence: $EVIDENCE_DIR"
  log "Failures:"
  grep "❌ FAIL" "$EVIDENCE_DIR/gates.log" || true
  exit 1
fi
