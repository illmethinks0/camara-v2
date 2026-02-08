# Approvals Ledger

**Status**: ACTIVE  
**Last Updated**: 2026-02-08  

---

## Overview

This file tracks all mandatory approvals for:
- New dependencies
- Schema changes
- Destructive operations

**Rule**: No approval = No merge

---

## Approval Format

```markdown
## APPROVAL-XXXX: Brief Description

**Date**: YYYY-MM-DD  
**Category**: [dependency|schema|destructive]  
**Change**: Description of change  
**Reason**: Why this change is needed  
**Alternatives Tried**: What was considered and rejected  
**Security Impact**: [none|low|medium|high]  
**Rollback Plan**: How to undo if needed  
**Approver**: Name/Email  
**Status**: [pending|approved|rejected]
```

---

## Approvals Log

_No approvals yet._

---

## Pending Approvals

_No pending approvals._

---

## Approval Rules by Tier

### Prototype
- Dependencies: Optional approval (document if significant)
- Schema: Approval recommended
- Destructive: Approval required

### Production
- Dependencies: Approval required (security audit)
- Schema: Approval required + rollback test
- Destructive: Approval required + maintenance window

### Regulated
- Dependencies: Dual approval + security review
- Schema: Dual approval + compliance review
- Destructive: Dual approval + change advisory board

---

*All approvals are immutable. Changes require new approval entry.*
