---
id: "202609151745-0YF9C9"
title: "Close Writer Phase 0-7 parity remediation findings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T17:46:02.319Z"
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
    body: "Start: restore the seven audited Writer Phase 0-7 contracts and boundaries against the pinned LibreOffice baseline, reject prior storage schemas, and verify the complete repository before push."
events:
  -
    type: "status"
    at: "2026-09-15T17:46:14.472Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the seven audited Writer Phase 0-7 contracts and boundaries against the pinned LibreOffice baseline, reject prior storage schemas, and verify the complete repository before push."
doc_version: 3
doc_updated_at: "2026-09-15T17:46:14.472Z"
doc_updated_by: "CODER"
description: "Fix all seven audited Phase 0-7 contract, ownership, list/font, dispatch, browser-boundary, localization, and persistence issues against pinned LibreOffice 26.8.0.2; reject prior stored schemas; verify, commit, finish, and push main."
sections:
  Summary: "Close all seven findings from the Phase 0-7 Writer parity audit against pinned LibreOffice 26.8.0.2."
  Scope: "In scope: svl item states; Sfx request/dispatch arguments; Writer nodes, positions, selections, lists, fonts, shells, browser projections, HTML/ODT Worker boundaries, localization, persistence schema, tests and parity inventories. Out of scope: new Writer capabilities or non-Writer suites. Prior stored Writer schemas must be rejected, not migrated."
  Plan: "1. Restore pinned SfxItemSet state propagation and item-copy semantics. 2. Route supported Writer commands through SfxRequest item arguments/returns. 3. Replace string node identity in core/shell contracts with SwNodeIndex, SwPosition, and SwPaM plus browser-only projection keys. 4. Port the bounded upstream list tree, numbering formats, continuation/restart behavior, and locale/device default-font policy. 5. Restore shell/browser dependency direction and move DOM/Worker adapters to browser-owned paths. 6. Complete localization and honest presentation boundaries. 7. Bump Writer persistence schema and reject every prior schema without migration. 8. Update parity/provenance data, run focused and full verification, commit, finish, and push origin/main."
  Verify Steps: |-
    1. Run focused tests for Sfx item inheritance, request/slot arguments, canonical SwPaM selection, list tree/restart/continuation, locale/device fonts, browser boundaries, persistence rejection, ODT and recovery. Expected: all pass.
    2. Run npm run inventory:invariants and npm run inventory:parity. Expected: pinned invariants pass, no known semantic boundary violations remain for the seven findings, and inventories resolve.
    3. Run npm run verify. Expected: formatting, lint, typecheck, dependency/resource checks, coverage, browser E2E, static build, docs, source tree/provenance and parity checks pass.
    4. Run node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and inspect git status. Expected: routing/doctor pass, no whitespace errors, and only intentional task changes plus the pre-existing task artifact are present.
    5. Commit intentional changes, record verification with ap verify, finish the task, and push origin main. Expected: remote main contains the task close commit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and deterministic task-close commits. Discard snapshots written with the new schema; do not restore compatibility for prior schemas."
  Findings: ""
id_source: "generated"
---
## Summary

Close all seven findings from the Phase 0-7 Writer parity audit against pinned LibreOffice 26.8.0.2.

## Scope

In scope: svl item states; Sfx request/dispatch arguments; Writer nodes, positions, selections, lists, fonts, shells, browser projections, HTML/ODT Worker boundaries, localization, persistence schema, tests and parity inventories. Out of scope: new Writer capabilities or non-Writer suites. Prior stored Writer schemas must be rejected, not migrated.

## Plan

1. Restore pinned SfxItemSet state propagation and item-copy semantics. 2. Route supported Writer commands through SfxRequest item arguments/returns. 3. Replace string node identity in core/shell contracts with SwNodeIndex, SwPosition, and SwPaM plus browser-only projection keys. 4. Port the bounded upstream list tree, numbering formats, continuation/restart behavior, and locale/device default-font policy. 5. Restore shell/browser dependency direction and move DOM/Worker adapters to browser-owned paths. 6. Complete localization and honest presentation boundaries. 7. Bump Writer persistence schema and reject every prior schema without migration. 8. Update parity/provenance data, run focused and full verification, commit, finish, and push origin/main.

## Verify Steps

1. Run focused tests for Sfx item inheritance, request/slot arguments, canonical SwPaM selection, list tree/restart/continuation, locale/device fonts, browser boundaries, persistence rejection, ODT and recovery. Expected: all pass.
2. Run npm run inventory:invariants and npm run inventory:parity. Expected: pinned invariants pass, no known semantic boundary violations remain for the seven findings, and inventories resolve.
3. Run npm run verify. Expected: formatting, lint, typecheck, dependency/resource checks, coverage, browser E2E, static build, docs, source tree/provenance and parity checks pass.
4. Run node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and inspect git status. Expected: routing/doctor pass, no whitespace errors, and only intentional task changes plus the pre-existing task artifact are present.
5. Commit intentional changes, record verification with ap verify, finish the task, and push origin main. Expected: remote main contains the task close commit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and deterministic task-close commits. Discard snapshots written with the new schema; do not restore compatibility for prior schemas.

## Findings
