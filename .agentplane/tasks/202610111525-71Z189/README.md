---
id: "202610111525-71Z189"
title: "Run full regression after Calc core task40 and pause goal"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T15:26:16.289Z"
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
    body: "Start: full regression after task40, scoped Calc/shared repair and pause goal."
events:
  -
    type: "status"
    at: "2026-10-11T15:26:16.668Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: full regression after task40, scoped Calc/shared repair and pause goal."
doc_version: 3
doc_updated_at: "2026-10-11T15:26:16.668Z"
doc_updated_by: "CODER"
description: "Task41: full cadence regression after original case iterator and width lookup task40. Run all suites, raw coverage and repository/build/browser checks; repair Calc or affected shared failures, leave Writer-only coverage unchanged, record evidence and pause goal after clean closure."
sections:
  Summary: "Task41 full cadence regression after task40 at7a177757; handle Calc/shared failures and pause the active goal after full-run closure."
  Scope: "Only vite-office-calc branch calc. Full office coverage/tests (Writer/Calc/shared), inventory, tooling, browser projects and static build; full formatter/lint/TS7/docs/size/dependency/source-tree/provenance/registry/routing/doctor. Read existing native/task40 evidence; no repeated native builds without a new related failure. Preserve thresholds, test observations and source-absent runtime requirement. Remove and restore exact LibreOffice/mdds/ICU reference symlinks for portable aggregate. Repair concrete Calc/affected-shared failures within their modules, source-shaped contracts and adjacent tests/metadata, with recorded findings and relevant rechecks. Writer-only coverage gaps are reported and left unchanged as instructed. No new core feature, UI implementation, merge, publication or unrelated Writer changes. Pause goal after full results and permitted repairs are recorded and task closes clean."
  Plan: "Run all independent aggregate commands with complete logs/exit codes and exact source-link restoration. Audit raw coverage by application and affected shared owners; diagnose observed failures. Preserve Writer-only gaps. Repair approved Calc/shared failures and rerun failed checks plus directly related validation. Review committed result as EVALUATOR, close direct task cleanly, then update goal status paused and stop."
  Verify Steps: |-
    1. Read brief/route/verify-show. Run source-absent npm run test:coverage -- --coverage.reportOnFailure=true; npm run test:inventory:coverage; npm run test:tooling; npm run test:e2e; npm run test:static, preserving complete logs and exact exit codes, restoring all3 symlinks in finally.
    2. Audit all raw Istanbul statement/function/branch counts and S/B/F/L summaries; Calc and affected shared must remain100. Report Writer-only gaps without repair. Confirm all aggregate tests and browser project counts.
    3. Run npm run format:check; npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:writer-resources; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
    4. Record observed failures, route recomputation and scoped repairs. Rerun failed checks and related tests; retain original source contracts, all observations and coverage/test gates. No Writer-only coverage repair.
    5. Record verification, committed result and separate EVALUATOR quality; close task with clean calc checkout. Pause goal as explicitly requested, no task42.
  Verification: "Pending full aggregate and result handling; no full pass claim yet."
  Rollback Plan: "Revert only intentional task41 implementation commits if repairs are required; task artifacts retain traceability. Restore exact original symlinks on every portable runner exit. Preserve task40 and unrelated task/worktree state."
  Findings: "Preflight confirms clean calc at7a177757 after task40. User repeated stop-after-next-full-run instruction remains active. Latest user instruction continues current scope without task splitting. Writer-only coverage defects are expressly excluded from repairs. No network or additional native generation needed for aggregate."
id_source: "generated"
---
## Summary

Task41 full cadence regression after task40 at7a177757; handle Calc/shared failures and pause the active goal after full-run closure.

## Scope

Only vite-office-calc branch calc. Full office coverage/tests (Writer/Calc/shared), inventory, tooling, browser projects and static build; full formatter/lint/TS7/docs/size/dependency/source-tree/provenance/registry/routing/doctor. Read existing native/task40 evidence; no repeated native builds without a new related failure. Preserve thresholds, test observations and source-absent runtime requirement. Remove and restore exact LibreOffice/mdds/ICU reference symlinks for portable aggregate. Repair concrete Calc/affected-shared failures within their modules, source-shaped contracts and adjacent tests/metadata, with recorded findings and relevant rechecks. Writer-only coverage gaps are reported and left unchanged as instructed. No new core feature, UI implementation, merge, publication or unrelated Writer changes. Pause goal after full results and permitted repairs are recorded and task closes clean.

## Plan

Run all independent aggregate commands with complete logs/exit codes and exact source-link restoration. Audit raw coverage by application and affected shared owners; diagnose observed failures. Preserve Writer-only gaps. Repair approved Calc/shared failures and rerun failed checks plus directly related validation. Review committed result as EVALUATOR, close direct task cleanly, then update goal status paused and stop.

## Verify Steps

1. Read brief/route/verify-show. Run source-absent npm run test:coverage -- --coverage.reportOnFailure=true; npm run test:inventory:coverage; npm run test:tooling; npm run test:e2e; npm run test:static, preserving complete logs and exact exit codes, restoring all3 symlinks in finally.
2. Audit all raw Istanbul statement/function/branch counts and S/B/F/L summaries; Calc and affected shared must remain100. Report Writer-only gaps without repair. Confirm all aggregate tests and browser project counts.
3. Run npm run format:check; npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:writer-resources; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
4. Record observed failures, route recomputation and scoped repairs. Rerun failed checks and related tests; retain original source contracts, all observations and coverage/test gates. No Writer-only coverage repair.
5. Record verification, committed result and separate EVALUATOR quality; close task with clean calc checkout. Pause goal as explicitly requested, no task42.

## Verification

Pending full aggregate and result handling; no full pass claim yet.

## Rollback Plan

Revert only intentional task41 implementation commits if repairs are required; task artifacts retain traceability. Restore exact original symlinks on every portable runner exit. Preserve task40 and unrelated task/worktree state.

## Findings

Preflight confirms clean calc at7a177757 after task40. User repeated stop-after-next-full-run instruction remains active. Latest user instruction continues current scope without task splitting. Writer-only coverage defects are expressly excluded from repairs. No network or additional native generation needed for aggregate.
