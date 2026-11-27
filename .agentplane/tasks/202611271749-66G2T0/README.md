---
id: "202611271749-66G2T0"
title: "Preserve native Calc sheet writing direction in ODS"
result_summary: "Calc preserves native writing direction in its ODS sheet styles and Worker document model."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:50:05.870Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T17:55:41.384Z"
  updated_by: "CODER"
  note: "87 focused Calc and shared Writer tests passed, including the original mixed-direction ODS, Worker and ODS reopen. Typecheck, ESLint, Prettier, module boundaries, provenance and scoped inventories passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T17:55:41.899Z"
  updated_by: "EVALUATOR"
  note: "Calc preserves the original table-family sheet writing mode through ODS and Worker."
  evaluated_sha: "10762f003f7af5bb21ecd39cdc3134e7e16b5e64"
  blueprint_digest: "9f974fb95ab03d9029284800f1f263ed6ea95d6d25c94c53bfa9bd59cad8f953"
  evidence_refs:
    - ".agentplane/tasks/202611271749-66G2T0/README.md"
    - ".agentplane/tasks/202611271749-66G2T0/quality/20261127-175541899-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271749-66G2T0/quality/20261127-175541899-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271749-66G2T0/quality/20261127-175541899-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271749-66G2T0/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/sheet-layout-verification.md"
  findings:
    - "Uses the pinned xmloff handler variant, native XML loading flag and canonical horizontal export tokens. Original mixed-direction ODS passed."
commit:
  hash: "10762f003f7af5bb21ecd39cdc3134e7e16b5e64"
  message: "🧩 66G2T0 calc: preserve native ODS sheet writing direction"
comments:
  -
    author: "CODER"
    body: "Start: port the native Calc ODS sheet writing direction and deferred load contract."
  -
    author: "CODER"
    body: "Verified: 87 targeted tests including original mixed-direction ODS and both transport paths passed."
events:
  -
    type: "status"
    at: "2026-11-27T17:50:06.402Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the native Calc ODS sheet writing direction and deferred load contract."
  -
    type: "verify"
    at: "2026-11-27T17:55:41.384Z"
    author: "CODER"
    state: "ok"
    note: "87 focused Calc and shared Writer tests passed, including the original mixed-direction ODS, Worker and ODS reopen. Typecheck, ESLint, Prettier, module boundaries, provenance and scoped inventories passed."
  -
    type: "status"
    at: "2026-11-27T17:56:53.472Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 87 targeted tests including original mixed-direction ODS and both transport paths passed."
doc_version: 3
doc_updated_at: "2026-11-27T17:56:53.473Z"
doc_updated_by: "CODER"
description: "Complete native Calc table-family writing direction over ODS import and export and Worker transfer. Retain the pinned xmloff token conversion, sheet property value semantics, deferred XML import direction, and ScTable ownership. Verify the existing pinned mixed-direction ODS and the existing sheet border, settings and filter cases."
sections:
  Summary: |-
    Preserve native Calc sheet writing direction in ODS

    Complete native Calc table-family writing direction over ODS import and export and Worker transfer. Retain the pinned xmloff token conversion, sheet property value semantics, deferred XML import direction, and ScTable ownership. Verify the existing pinned mixed-direction ODS and the existing sheet border, settings and filter cases.
  Scope: |-
    - In scope: Complete native Calc table-family writing direction over ODS import and export and Worker transfer. Retain the pinned xmloff token conversion, sheet property value semantics, deferred XML import direction, and ScTable ownership. Verify the existing pinned mixed-direction ODS and the existing sheet border, settings and filter cases.
    - Out of scope: unrelated refactors not required for "Preserve native Calc sheet writing direction in ODS".
  Plan: "Port the shared text writing mode handler variant, the Calc table-family SheetLayout property boundary, and the ScDocument XML import direction transition. Write the canonical ODS table property and preserve the actual ScTable flag through Worker transfer with a default for older records. Exercise the original pinned mixed-direction cell-invalidations ODS through import, export and Worker, and the related border, ODS table styles and codec tests. Drawing mirroring and browser tiled rendering are outside the current Calc core slice."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Calc sheet writing direction in ODS". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Calc sheet writing direction in ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T17:55:41.384Z — VERIFY — ok

    By: CODER

    Note: 87 focused Calc and shared Writer tests passed, including the original mixed-direction ODS, Worker and ODS reopen. Typecheck, ESLint, Prettier, module boundaries, provenance and scoped inventories passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:50:06.402Z, excerpt_hash=sha256:03ee4c28a3b91d028ec766ef81e87047b7c7d429c0bdf8acc19acf7c997d347f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271749-66G2T0/blueprint/resolved-snapshot.json
    - old_digest: 9f974fb95ab03d9029284800f1f263ed6ea95d6d25c94c53bfa9bd59cad8f953
    - current_digest: 9f974fb95ab03d9029284800f1f263ed6ea95d6d25c94c53bfa9bd59cad8f953
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271749-66G2T0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271749-66G2T0
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

Preserve native Calc sheet writing direction in ODS

Complete native Calc table-family writing direction over ODS import and export and Worker transfer. Retain the pinned xmloff token conversion, sheet property value semantics, deferred XML import direction, and ScTable ownership. Verify the existing pinned mixed-direction ODS and the existing sheet border, settings and filter cases.

## Scope

- In scope: Complete native Calc table-family writing direction over ODS import and export and Worker transfer. Retain the pinned xmloff token conversion, sheet property value semantics, deferred XML import direction, and ScTable ownership. Verify the existing pinned mixed-direction ODS and the existing sheet border, settings and filter cases.
- Out of scope: unrelated refactors not required for "Preserve native Calc sheet writing direction in ODS".

## Plan

Port the shared text writing mode handler variant, the Calc table-family SheetLayout property boundary, and the ScDocument XML import direction transition. Write the canonical ODS table property and preserve the actual ScTable flag through Worker transfer with a default for older records. Exercise the original pinned mixed-direction cell-invalidations ODS through import, export and Worker, and the related border, ODS table styles and codec tests. Drawing mirroring and browser tiled rendering are outside the current Calc core slice.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Calc sheet writing direction in ODS". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Calc sheet writing direction in ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T17:55:41.384Z — VERIFY — ok

By: CODER

Note: 87 focused Calc and shared Writer tests passed, including the original mixed-direction ODS, Worker and ODS reopen. Typecheck, ESLint, Prettier, module boundaries, provenance and scoped inventories passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:50:06.402Z, excerpt_hash=sha256:03ee4c28a3b91d028ec766ef81e87047b7c7d429c0bdf8acc19acf7c997d347f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271749-66G2T0/blueprint/resolved-snapshot.json
- old_digest: 9f974fb95ab03d9029284800f1f263ed6ea95d6d25c94c53bfa9bd59cad8f953
- current_digest: 9f974fb95ab03d9029284800f1f263ed6ea95d6d25c94c53bfa9bd59cad8f953
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271749-66G2T0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271749-66G2T0
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
