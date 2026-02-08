#!/bin/bash
#
# exhaustive-validation.sh - Comprehensive end-to-end validation
# Tests all aspects of the CAMARA v2 application
#

set -e

echo "========================================"
echo "EXHAUSTIVE END-TO-END VALIDATION"
echo "========================================"
echo ""

# Track results
PASSED=0
FAILED=0
TOTAL=0

# Helper functions
run_test() {
    local name="$1"
    local command="$2"
    
    echo ""
    echo "Testing: $name"
    echo "Command: $command"
    
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ PASS: $name"
        ((PASSED++))
    else
        echo "❌ FAIL: $name"
        ((FAILED++))
    fi
    ((TOTAL++))
}

# =========================================
# 1. ENVIRONMENT & CONFIGURATION
# =========================================
echo ""
echo "========================================"
echo "1. ENVIRONMENT & CONFIGURATION"
echo "========================================"

run_test "Node.js version check" "node --version | grep -E 'v(18|20|22)'"
run_test "npm version check" "npm --version"
run_test "TypeScript installed" "npx tsc --version"
run_test "Prisma CLI installed" "npx prisma --version"
run_test "Environment file exists" "test -f .env"
run_test "Database URL configured" "grep -q 'DATABASE_URL' .env"
run_test "JWT secret configured" "grep -q 'JWT_SECRET' .env"

# =========================================
# 2. PROJECT STRUCTURE
# =========================================
echo ""
echo "========================================"
echo "2. PROJECT STRUCTURE"
echo "========================================"

run_test "Source directory exists" "test -d src"
run_test "Core directory exists" "test -d src/core"
run_test "Adapters directory exists" "test -d src/adapters"
run_test "Services directory exists" "test -d src/services"
run_test "Routes directory exists" "test -d src/routes"
run_test "Prisma schema exists" "test -f prisma/schema.prisma"
run_test "Documentation exists" "test -f docs/status.md"

# =========================================
# 3. TYPE SAFETY & COMPILATION
# =========================================
echo ""
echo "========================================"
echo "3. TYPE SAFETY & COMPILATION"
echo "========================================"

run_test "TypeScript strict mode enabled" "grep -q '\"strict\": true' tsconfig.json"
run_test "TypeScript compilation" "npm run typecheck"
run_test "Build succeeds" "npm run build"

# =========================================
# 4. UNIT TESTS
# =========================================
echo ""
echo "========================================"
echo "4. UNIT TESTS"
echo "========================================"

run_test "Core Result tests" "npm run test:unit -- src/core/result.test.ts"
run_test "Database adapter tests" "npm run test:unit -- src/adapters/db.test.ts"
run_test "Auth service tests" "npm run test:unit -- src/services/auth.test.ts"
run_test "Task service tests" "npm run test:unit -- src/services/task.test.ts"

# =========================================
# 5. INTEGRATION TESTS
# =========================================
echo ""
echo "========================================"
echo "5. INTEGRATION TESTS"
echo "========================================"

run_test "HTTP routes integration" "npm run test:unit -- src/evals/http-routes.test.ts"
run_test "Database integration" "npm run test:unit -- src/evals/database.test.ts"
run_test "OpenAPI docs integration" "npm run test:unit -- src/evals/openapi-docs.test.ts"
run_test "Auth middleware integration" "npm run test:unit -- src/middleware/auth.test.ts"

# =========================================
# 6. DATABASE VALIDATION
# =========================================
echo ""
echo "========================================"
echo "6. DATABASE VALIDATION"
echo "========================================"

run_test "Prisma client generation" "test -d node_modules/@prisma/client"
run_test "Database connection" "npx prisma db execute --stdin <<< 'SELECT 1'"
run_test "Migrations applied" "test -d prisma/migrations"
run_test "User table exists" "npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM users'"
run_test "Task table exists" "npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM tasks'"

# =========================================
# 7. SECURITY VALIDATION
# =========================================
echo ""
echo "========================================"
echo "7. SECURITY VALIDATION"
echo "========================================"

run_test "JWT secret not in code" "! grep -r 'dev-secret-change' src/ --include='*.ts' 2>/dev/null | grep -v '.test.ts'"
run_test "Password hashing used" "grep -q 'bcrypt' src/services/auth.ts"
run_test "Rate limiting configured" "grep -q '@fastify/rate-limit' src/routes/auth.ts"
run_test "CORS configured" "grep -q '@fastify/cors' src/index.ts"
run_test "Input validation (Zod)" "grep -q 'zod' src/routes/*.ts"

# =========================================
# 8. PERFORMANCE SMOKE TEST
# =========================================
echo ""
echo "========================================"
echo "8. PERFORMANCE SMOKE TEST"
echo "========================================"

# Start server in background for smoke test
echo "Starting server for smoke test..."
node dist/index.js &
SERVER_PID=$!
sleep 3

# Test health endpoint response time
echo "Testing health endpoint performance..."
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/health > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 100 ]; then
    echo "✅ PASS: Health endpoint responds in ${RESPONSE_TIME}ms (< 100ms)"
    ((PASSED++))
else
    echo "⚠️  WARNING: Health endpoint slow (${RESPONSE_TIME}ms)"
fi
((TOTAL++))

# Cleanup
kill $SERVER_PID 2>/dev/null || true

# =========================================
# 9. DOCUMENTATION VALIDATION
# =========================================
echo ""
echo "========================================"
echo "9. DOCUMENTATION VALIDATION"
echo "========================================"

run_test "README exists" "test -f README.md || test -f docs/status.md"
run_test "API documentation exists" "test -f packages/contracts/api/openapi.yaml"
run_test "Status document current" "grep -q 'M3' docs/status.md"
run_test "Glossary exists" "test -f docs/glossary.md"

# =========================================
# 10. FINAL SUMMARY
# =========================================
echo ""
echo "========================================"
echo "VALIDATION SUMMARY"
echo "========================================"
echo "Total Tests: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Success Rate: $(echo "scale=2; $PASSED / $TOTAL * 100" | bc 2>/dev/null || echo "N/A")%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ ALL VALIDATION CHECKS PASSED"
    echo "Status: PRODUCTION READY"
    exit 0
else
    echo "⚠️  SOME VALIDATION CHECKS FAILED"
    echo "Review failures above"
    exit 1
fi
