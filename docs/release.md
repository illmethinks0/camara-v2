# Release Process

**Status**: DRAFT  
**Version**: 1.0.0  

---

## Release Checklist

### Pre-Staging

- [ ] All M2 tasks complete
- [ ] LKGC streak meets tier requirement
- [ ] `scripts/gates.sh` passes locally
- [ ] `docs/approvals.md` up to date
- [ ] No unresolved blockers

### Staging Deployment

1. **Deploy to Staging**
   ```bash
   npm run deploy:staging
   ```

2. **Staging Validation**
   ```bash
   npm run test:staging
   ```
   - Health checks pass
   - Smoke tests pass
   - Contract tests pass
   - Integration tests pass

3. **Monitoring Setup**
   - Dashboards configured
   - Alerts active
   - Logs streaming

### Production Deployment

1. **Final Approval**
   - Review `docs/approvals.md`
   - Verify rollback plan
   - Confirm maintenance window

2. **Deploy**
   ```bash
   npm run deploy:production
   ```

3. **Post-Deploy Verification**
   ```bash
   npm run test:smoke:production
   ```

---

## Rollback Plan

### Automated Rollback Triggers

- Health check fails for > 5 minutes
- Error rate > 1%
- Latency p99 > 2s

### Manual Rollback

```bash
# Render example
render deploys rollback --service <id>

# Database rollback (if migration reversible)
npm run db:migrate:rollback
```

### Rollback Verification

1. Confirm previous version deployed
2. Run smoke tests
3. Verify database state
4. Check logs for errors

---

## Post-Release Rules

### Incident Response

Every production incident MUST result in:

1. **Immediate**: Rollback if needed
2. **Within 1 hour**: Incident report in `docs/incidents/`
3. **Within 24 hours**: Root cause analysis
4. **Within 1 week**: New test/eval added to prevent recurrence

### Incident Report Template

```markdown
# INCIDENT-0001: Brief Description

**Date**: YYYY-MM-DD  
**Severity**: [critical|high|medium|low]  
**Duration**: X minutes  
**Impact**: Description of user impact

## Timeline
- HH:MM - Event detected
- HH:MM - Action taken
- HH:MM - Resolution

## Root Cause
Description of what went wrong

## Resolution
How it was fixed

## Preventive Measures
- [ ] Test added to catch this
- [ ] Monitoring improved
- [ ] Process updated

## Related
- PR #XXX (fix)
- ADR #XXX (if architecture change needed)
```

---

## Monitoring

### Required Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Error Rate | > 1% | PagerDuty |
| Latency p99 | > 2s | Slack |
| CPU Usage | > 80% | Slack |
| Memory Usage | > 80% | Slack |
| DB Connections | > 80% | Slack |

### Required Logs

All services must emit:
- Request logs (method, path, status, duration)
- Error logs (stack trace, context)
- Business events (user actions)

### Dashboards

- **Health Overview**: Uptime, error rate, latency
- **Business Metrics**: Active users, transaction volume
- **Infrastructure**: CPU, memory, DB connections

---

## Version Tagging

```bash
# After successful production deploy
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

*Releases require approval. Post-incident, always add preventive tests.*
