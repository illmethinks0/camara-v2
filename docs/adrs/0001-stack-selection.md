# ADR-0001: Stack Selection

**Status**: PROPOSED  
**Date**: 2026-02-08  
**Deciders**: Agent  

---

## Context

Need to select the primary technology stack for CAMARA v2. The stack must support:
- Type safety
- Railway pattern implementation
- Rapid development
- Production readiness

---

## Decision

### Primary Language: TypeScript

**Rationale**:
- Static typing catches errors at compile time
- Excellent ecosystem for web development
- Familiar to most developers
- Strong tooling (VS Code, ESLint, Prettier)

### Runtime: Node.js 18+

**Rationale**:
- LTS support
- Native fetch API
- Performance improvements
- Wide platform support

### Backend Framework: Express.js or Fastify

**Rationale**:
- Express: Battle-tested, huge ecosystem
- Fastify: Better performance, built-in schema validation

**Decision**: Fastify (pending prototype validation)

### Database: PostgreSQL

**Rationale**:
- ACID compliance
- JSON support
- Full-text search
- Industry standard

### ORM: Prisma

**Rationale**:
- Type-safe database queries
- Excellent migration system
- Auto-generated types
- Good developer experience

### Frontend: React + Next.js

**Rationale**:
- Component-based architecture
- Server-side rendering
- File-based routing
- Vercel ecosystem

### Styling: Tailwind CSS

**Rationale**:
- Utility-first approach
- Small bundle size
- Easy theming
- Good TypeScript support

---

## Consequences

### Positive
- Type safety across the stack
- Excellent developer experience
- Strong community support
- Easy hiring

### Negative
- Node.js single-threaded limitations (mitigated by clustering)
- TypeScript compilation overhead
- Prisma cold start (mitigated by connection pooling)

---

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Python/FastAPI | Less frontend synergy |
| Go | More verbose error handling |
| Rust | Slower development velocity |
| Ruby on Rails | Less type safety |
| Deno | Smaller ecosystem |

---

## Compliance

This decision affects:
- `docs/spec_v1.md` - Type definitions
- `docs/evals.md` - Testing strategy
- `package.json` - Dependencies

---

*PROPOSED: Awaiting approval to proceed*
