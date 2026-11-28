---
id: "202611281026-ABAV8Y"
title: "Align Writer ODT table formula calculation and cached values"
result_summary: "Aligned represented ODT table box calculation with the pinned Writer field and cell contracts."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T10:27:02.795Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T10:34:20.375Z"
  updated_by: "CODER"
  note: "Passed 36 focused Writer tests. The pinned tdf91801 calculation yields 555 across Worker and ODT, and tdf139126 retains its numeric and error boxes. TypeScript, scoped ESLint, dependencies, provenance and Writer inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T10:34:20.826Z"
  updated_by: "EVALUATOR"
  note: "Writer recalculates represented ODT table box formulas with the original field owners and publishes native value items."
  evaluated_sha: "913f93d12c01140d306a6d4806d96abdb843d880"
  blueprint_digest: "489354d16c51a6f68615aed192d12c7e3f6394320c1f156627004c2c376e21c1"
  evidence_refs:
    - ".agentplane/tasks/202611281026-ABAV8Y/README.md"
    - ".agentplane/tasks/202611281026-ABAV8Y/quality/20261128-103420826-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611281026-ABAV8Y/quality/20261128-103420826-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611281026-ABAV8Y/quality/20261128-103420826-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611281026-ABAV8Y/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/writer-table-formula-verification.md"
  findings:
    - "Both pinned formula fixtures retain results, source and native box ownership through the Worker and ODT export."
commit:
  hash: "913f93d12c01140d306a6d4806d96abdb843d880"
  message: "🧩 ABAV8Y writer: recalculate native ODT table box formulas"
comments:
  -
    author: "CODER"
    body: "Start: connect native table formulas and Writer field variables to the ODT load path."
  -
    author: "CODER"
    body: "Verified: pinned Writer table formulas with calculated value, dependent user variables and numeric/error state across Worker and ODT. Thirty-six focused tests and static gates passed."
events:
  -
    type: "status"
    at: "2026-11-28T10:27:03.153Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native table formulas and Writer field variables to the ODT load path."
  -
    type: "verify"
    at: "2026-11-28T10:34:20.375Z"
    author: "CODER"
    state: "ok"
    note: "Passed 36 focused Writer tests. The pinned tdf91801 calculation yields 555 across Worker and ODT, and tdf139126 retains its numeric and error boxes. TypeScript, scoped ESLint, dependencies, provenance and Writer inventory passed."
  -
    type: "status"
    at: "2026-11-28T10:35:21.348Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: pinned Writer table formulas with calculated value, dependent user variables and numeric/error state across Worker and ODT. Thirty-six focused tests and static gates passed."
doc_version: 3
doc_updated_at: "2026-11-28T10:35:21.349Z"
doc_updated_by: "CODER"
description: "Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture."
sections:
  Summary: |-
    Align Writer ODT table formula calculation and cached values

    Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.
  Scope: |-
    - In scope: Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.
    - Out of scope: unrelated refactors not required for "Align Writer ODT table formula calculation and cached values".
  Plan: "Port SwTableFormula reference scanning and SwTableCalcPara ownership with native box lookup, numeric caches, bounded dependency recursion and native error state. Seed each table calculation from the actual user and SetExpression field owners in document order. Invoke table field updates after content import and at represented layout updates, and keep native Worker box attributes and ODT serialization. Adapt the pinned FODT regression to the represented ODT content stream and run existing focused table and field tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT table formula calculation and cached values". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT table formula calculation and cached values". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T10:34:20.375Z — VERIFY — ok

    By: CODER

    Note: Passed 36 focused Writer tests. The pinned tdf91801 calculation yields 555 across Worker and ODT, and tdf139126 retains its numeric and error boxes. TypeScript, scoped ESLint, dependencies, provenance and Writer inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:27:03.153Z, excerpt_hash=sha256:9590409ab363d684ea320749290935d83030123a34af39321e2336149e169279

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281026-ABAV8Y/blueprint/resolved-snapshot.json
    - old_digest: 489354d16c51a6f68615aed192d12c7e3f6394320c1f156627004c2c376e21c1
    - current_digest: 489354d16c51a6f68615aed192d12c7e3f6394320c1f156627004c2c376e21c1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281026-ABAV8Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281026-ABAV8Y
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer ODT table formula calculation and cached values

Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.

## Scope

- In scope: Connect represented Writer table box formulas with the native table calculation owner, named box and range resolution, expression variables and numeric result storage. Trigger the represented field update after ODT import and keep existing Worker, number formatting, and error sentinel behavior. Replay the original tdf91801 field-variable calculation and the existing ODT table fixture.
- Out of scope: unrelated refactors not required for "Align Writer ODT table formula calculation and cached values".

## Plan

Port SwTableFormula reference scanning and SwTableCalcPara ownership with native box lookup, numeric caches, bounded dependency recursion and native error state. Seed each table calculation from the actual user and SetExpression field owners in document order. Invoke table field updates after content import and at represented layout updates, and keep native Worker box attributes and ODT serialization. Adapt the pinned FODT regression to the represented ODT content stream and run existing focused table and field tests.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT table formula calculation and cached values". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT table formula calculation and cached values". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T10:34:20.375Z — VERIFY — ok

By: CODER

Note: Passed 36 focused Writer tests. The pinned tdf91801 calculation yields 555 across Worker and ODT, and tdf139126 retains its numeric and error boxes. TypeScript, scoped ESLint, dependencies, provenance and Writer inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:27:03.153Z, excerpt_hash=sha256:9590409ab363d684ea320749290935d83030123a34af39321e2336149e169279

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281026-ABAV8Y/blueprint/resolved-snapshot.json
- old_digest: 489354d16c51a6f68615aed192d12c7e3f6394320c1f156627004c2c376e21c1
- current_digest: 489354d16c51a6f68615aed192d12c7e3f6394320c1f156627004c2c376e21c1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281026-ABAV8Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281026-ABAV8Y
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
