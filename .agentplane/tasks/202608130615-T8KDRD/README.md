---
id: "202608130615-T8KDRD"
title: "Repair Writer parity mappings after module identity migration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T06:16:03.549Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: repair stale local Writer parity paths after the audited module identity migration."
events:
  -
    type: "status"
    at: "2026-08-13T06:16:04.142Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: repair stale local Writer parity paths after the audited module identity migration."
doc_version: 3
doc_updated_at: "2026-08-13T06:16:44.409Z"
doc_updated_by: "CODER"
description: "Update all local Writer implementation and test paths in machine-readable parity records after the concrete LibreOffice-derived module rename, then validate inventory resolution."
sections:
  Summary: |-
    Repair Writer parity mappings after module identity migration

    Update all local Writer implementation and test paths in machine-readable parity records after the concrete LibreOffice-derived module rename, then validate inventory resolution.
  Scope: |-
    - In scope: Update all local Writer implementation and test paths in machine-readable parity records after the concrete LibreOffice-derived module rename, then validate inventory resolution.
    - Out of scope: unrelated refactors not required for "Repair Writer parity mappings after module identity migration".
  Plan: "1. Identify every stale local path in Writer parity records caused by the concrete module identity migration. 2. Replace only those paths with their current audited equivalents and retain unchanged markers. 3. Validate all Writer parity records against the pinned baseline plus source-tree, docs, and routing gates. 4. Record the mapping repair and the user-approved deferred aggregate-test cadence."
  Verify Steps: |-
    1. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: every Writer mapping resolves its current local path and upstream evidence.
    2. Run npm run check:source-tree && npm run check:docs && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: documented source identity and documentation checks pass.
    3. Defer npm run verify and full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: every Writer record resolves current local and pinned upstream evidence; 0 exceptions.
    Scope: stale local module paths in Writer parity mappings.

    Command: npm run check:source-tree && npm run check:docs && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: source-tree identity, documentation, diff, AgentPlane doctor, and policy routing checks pass.
    Scope: parity-record repair.

    Skipped: npm run verify and full browser matrix.
    Reason: user-approved full-run cadence is every ten closed tasks.
    Risk: no executable behavior changed; broad aggregate checks remain deferred.
    Approval: user blanket approval and explicit cadence instruction.
id_source: "generated"
---
## Summary

Repair Writer parity mappings after module identity migration

Update all local Writer implementation and test paths in machine-readable parity records after the concrete LibreOffice-derived module rename, then validate inventory resolution.

## Scope

- In scope: Update all local Writer implementation and test paths in machine-readable parity records after the concrete LibreOffice-derived module rename, then validate inventory resolution.
- Out of scope: unrelated refactors not required for "Repair Writer parity mappings after module identity migration".

## Plan

1. Identify every stale local path in Writer parity records caused by the concrete module identity migration. 2. Replace only those paths with their current audited equivalents and retain unchanged markers. 3. Validate all Writer parity records against the pinned baseline plus source-tree, docs, and routing gates. 4. Record the mapping repair and the user-approved deferred aggregate-test cadence.

## Verify Steps

1. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: every Writer mapping resolves its current local path and upstream evidence.
2. Run npm run check:source-tree && npm run check:docs && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: documented source identity and documentation checks pass.
3. Defer npm run verify and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: every Writer record resolves current local and pinned upstream evidence; 0 exceptions.
Scope: stale local module paths in Writer parity mappings.

Command: npm run check:source-tree && npm run check:docs && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: source-tree identity, documentation, diff, AgentPlane doctor, and policy routing checks pass.
Scope: parity-record repair.

Skipped: npm run verify and full browser matrix.
Reason: user-approved full-run cadence is every ten closed tasks.
Risk: no executable behavior changed; broad aggregate checks remain deferred.
Approval: user blanket approval and explicit cadence instruction.
