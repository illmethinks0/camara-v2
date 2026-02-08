# ADR-0004: Data Classification & Retention

**Status**: PROPOSED  
**Date**: 2026-02-08  
**Deciders**: Agent  

---

## Context

Need to classify data by sensitivity and define retention policies for compliance and storage management.

---

## Decision

### Data Classification Levels

| Level | Description | Examples | Handling |
|-------|-------------|----------|----------|
| **Public** | No restrictions | Marketing content, public docs | Standard |
| **Internal** | Company-only | Task data, analytics | Authentication required |
| **Confidential** | Restricted access | Business metrics, strategy | Authorization required |
| **PII** | Personally Identifiable | Email, name, user data | Encryption, GDPR compliance |
| **Sensitive PII** | High risk | Passwords, tokens, SSN | Encryption, strict access |

### Entity Classifications

| Entity | Fields | Classification | Retention |
|--------|--------|----------------|-----------|
| **User** | id, email, name | PII | 7 years |
| **User** | password_hash | Sensitive PII | Until account deletion |
| **User** | role, created_at | Internal | 7 years |
| **Task** | All fields | Internal | 3 years |
| **AuditLog** | All fields | Confidential | 1 year |
| **Session** | token, expires_at | Sensitive PII | Until expiration |

### Retention Policies

#### Automatic Deletion
- **Sessions**: Deleted on expiration or logout
- **Audit Logs**: Archived after 1 year, deleted after 2 years
- **Soft-deleted records**: Purged after 30 days

#### GDPR Compliance
- Right to access: Export all user data within 30 days
- Right to erasure: Hard delete within 30 days of request
- Data portability: JSON export format

### Encryption

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| PII | AES-256 | TLS 1.3 |
| Sensitive PII | AES-256 + field-level | TLS 1.3 |
| Passwords | bcrypt (hash) | TLS 1.3 |
| Tokens | SHA-256 (hash) | TLS 1.3 |

### Field-Level Encryption

Sensitive PII fields encrypted before database storage:

```typescript
// packages/backend/src/crypto/fieldEncryption.ts
export function encryptField(plaintext: string): string {
  // AES-256-GCM with key from env
}

export function decryptField(ciphertext: string): string {
  // Decrypt and verify tag
}
```

### Access Logging

All access to PII/Sensitive PII logged:

```typescript
// packages/backend/src/audit/accessLog.ts
export function logAccess(
  userId: string,
  resource: string,
  action: 'read' | 'write' | 'delete',
  context: Record<string, unknown>
) {
  // Write to audit log
}
```

---

## Consequences

### Positive
- GDPR compliance
- Clear data handling rules
- Automated retention
- Audit trail

### Negative
- Performance overhead for encryption
- Complexity in data export
- Storage costs for retention

---

## Implementation

### Database Schema

```prisma
// packages/backend/prisma/schema.prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique  // PII - encrypted at rest
  name          String            // PII
  passwordHash  String            // Sensitive PII
  role          Role
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?         // Soft delete
  
  @@index([deletedAt])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String
  resource  String
  context   Json
  createdAt DateTime @default(now())
  
  @@index([createdAt])
  @@index([userId])
}
```

### Retention Job

```typescript
// packages/backend/src/jobs/retention.ts
export async function purgeExpiredData() {
  // Soft-deleted users after 30 days
  await db.user.deleteMany({
    where: { deletedAt: { lt: subDays(new Date(), 30) } }
  });
  
  // Old audit logs after 2 years
  await db.auditLog.deleteMany({
    where: { createdAt: { lt: subYears(new Date(), 2) } }
  });
}
```

---

## Compliance

This decision affects:
- Database schema design
- Encryption implementation
- Audit logging
- Data export functionality
- Retention job scheduling

---

*PROPOSED: Awaiting approval to proceed*
