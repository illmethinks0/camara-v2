# ADR-0005: Authentication & Session Management

**Status**: PROPOSED  
**Date**: 2026-02-08  
**Deciders**: Agent  

---

## Context

Need a secure, scalable authentication system that:
- Works across frontend and backend
- Supports API clients
- Is stateless (no server-side sessions)
- Provides adequate security for prototype → production → regulated tiers

---

## Decision

### Authentication Method: JWT (JSON Web Tokens)

**Rationale**:
- Stateless (no server storage)
- Cross-domain capable
- Industry standard
- Easy to implement
- Works for web and API clients

### Token Structure

**Access Token**:
- Type: JWT (signed, not encrypted)
- Payload: userId, email, role, iat, exp
- Expiration: 15 minutes
- Storage: HTTP-only cookie or Authorization header

**Refresh Token**:
- Type: JWT (signed)
- Payload: userId, tokenId, iat, exp
- Expiration: 7 days
- Storage: HTTP-only cookie (secure, same-site=strict)
- Database: Stored hashed for revocation

### Authentication Flow

```
1. Login
   POST /auth/login
   { email, password }
   → Verify password
   → Create access token (15 min)
   → Create refresh token (7 days, store hash)
   → Set cookies

2. Authenticated Request
   Cookie: access_token=xxx
   → Verify signature
   → Check expiration
   → Attach user to request

3. Token Refresh
   POST /auth/refresh
   Cookie: refresh_token=xxx
   → Verify signature
   → Check against database (not revoked)
   → Issue new access token
   → Rotate refresh token (new token, revoke old)

4. Logout
   POST /auth/logout
   → Clear cookies
   → Revoke refresh token in DB
```

### Password Requirements

- Minimum 12 characters
- Must include: uppercase, lowercase, number, special char
- bcrypt with cost factor 12
- No plaintext storage (ever)

### Session Management

```typescript
// packages/backend/src/auth/session.ts
interface Session {
  userId: string;
  tokenId: string;      // Unique per refresh token
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Store in database
model RefreshToken {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique  // SHA-256 of token
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
  ipAddress String?
  userAgent String?
  
  @@index([userId])
  @@index([tokenHash])
}
```

### Authorization

Role-based access control (RBAC):

```typescript
// packages/backend/src/auth/rbac.ts
enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

const PERMISSIONS = {
  'user:read': [Role.USER, Role.ADMIN],
  'user:write': [Role.USER, Role.ADMIN],
  'user:delete': [Role.ADMIN],
  'task:read': [Role.USER, Role.ADMIN],
  'task:write': [Role.USER, Role.ADMIN],
  'task:delete': [Role.USER, Role.ADMIN],
  'admin:access': [Role.ADMIN],
};

export function hasPermission(user: User, permission: string): boolean {
  return PERMISSIONS[permission]?.includes(user.role) ?? false;
}
```

### Security Measures

1. **HTTPS Only**: All auth endpoints require TLS
2. **HTTP-Only Cookies**: XSS protection
3. **SameSite=Strict**: CSRF protection
4. **Rate Limiting**: Login endpoint limited to 5 attempts per 15 minutes per IP
5. **Token Rotation**: New refresh token on each use
6. **Automatic Expiration**: Short-lived access tokens

### Logout & Revocation

- Immediate revocation via database flag
- Cleanup job removes expired tokens
- User can view/revoke sessions

---

## Consequences

### Positive
- Stateless (scalable)
- No server-side session storage
- Works for SPAs and APIs
- Revocation still possible (refresh tokens)

### Negative
- JWT cannot be revoked immediately (mitigated by short expiry)
- Token size (mitigated by minimal payload)
- Clock skew issues (mitigated by leeway)

---

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Server-side sessions | Requires shared storage (Redis) |
| OAuth2/OIDC | Overkill for initial version |
| API Keys | Less secure, no expiration |
| Session Cookies | CSRF complexity |

---

## Implementation

### Dependencies

```json
{
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "cookie-parser": "^1.4.6"
}
```

### Environment Variables

```env
JWT_SECRET=changeme-in-production-min-256-bits
JWT_ACCESS_EXPIRY=900  # 15 minutes in seconds
JWT_REFRESH_EXPIRY=604800  # 7 days in seconds
BCRYPT_ROUNDS=12
```

### Middleware

```typescript
// packages/backend/src/middleware/auth.ts
export async function authenticateRequest(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch (e) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}
```

---

## Compliance

This decision affects:
- Login/logout endpoints
- Protected route middleware
- User model (password hash field)
- Refresh token database schema
- API client authentication
- Frontend cookie handling

---

*PROPOSED: Awaiting approval to proceed*
