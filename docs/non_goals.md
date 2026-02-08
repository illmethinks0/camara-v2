# Non-Goals

**Status**: ACTIVE  
**Version**: 1.0.0  

---

## Purpose

This document explicitly lists what is **NOT** in scope for this project. It prevents scope creep and aligns the team on boundaries.

---

## Out of Scope

### Features

1. **Mobile Native Apps**
   - No iOS/Android native development
   - Progressive Web App (PWA) is acceptable
   - Mobile-responsive web is required

2. **Real-time Collaboration**
   - No WebSocket-based live editing
   - No operational transform (OT) algorithms
   - Basic real-time notifications acceptable via polling

3. **Machine Learning Features**
   - No recommendation engines
   - No predictive analytics
   - No NLP/AI-generated content

4. **Third-party Integrations**
   - No Slack/Discord bots (initially)
   - No GitHub/Jira sync (initially)
   - API webhooks acceptable for future use

5. **Multi-tenancy**
   - Single-tenant architecture only
   - No organization isolation
   - No white-labeling

### Technical

6. **Microservices**
   - Monolithic architecture only
   - No service mesh
   - No inter-service RPC

7. **GraphQL**
   - REST API only
   - No GraphQL schema
   - No Apollo Federation

8. **Caching Layers**
   - No Redis (initially)
   - No CDN (initially)
   - Database-level caching acceptable

9. **Message Queues (Complex)**
   - No Kafka/RabbitMQ
   - Simple job queue (Bull/BullMQ) acceptable

10. **Analytics Warehouse**
    - No ClickHouse/BigQuery
    - Basic PostgreSQL aggregations acceptable

---

## Scope Boundaries

| Area | In Scope | Out of Scope |
|------|----------|--------------|
| Auth | JWT-based sessions | OAuth providers, SAML |
| Storage | PostgreSQL | MongoDB, DynamoDB |
| Frontend | React + Next.js | Vue, Angular, Svelte |
| Styling | Tailwind CSS | Styled-components, Sass |
| Testing | Vitest, React Testing Library | Cypress (initially) |
| Deployment | Render/Supabase | AWS, GCP, Azure |
| Monitoring | Basic logging | APM, distributed tracing |

---

## Future Considerations

These may be added in future versions (M4+):

- Real-time collaboration (WebSocket)
- Slack integration
- Advanced analytics
- Mobile app
- GraphQL API

---

## Alignment Check

This document must align with:
- `docs/inputs_pack.md` - assumptions and constraints
- `docs/spec_v1.md` - technical boundaries

**Conflict Resolution**: Non-goals take precedence over feature requests.

---

*Any request for out-of-scope features requires new approval and ADR.*
