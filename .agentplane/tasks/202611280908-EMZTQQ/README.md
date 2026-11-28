---
id: "202611280908-EMZTQQ"
title: "Align Calc ODS label-range interchange and formula resolution"
result_summary: "Aligned ODS label range and intersection behavior with the pinned Calc core and preserved both label lists in the Worker."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T09:09:08.127Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T09:22:15.036Z"
  updated_by: "CODER"
  note: "46 affected Calc tests and nine shared compiler tests passed. TypeScript, scoped ESLint, module boundaries, source provenance and Calc registry checks passed. The Calc registry reported zero semantic violations."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T09:22:15.545Z"
  updated_by: "EVALUATOR"
  note: "ODS label range and formula intersection contracts match the pinned Calc source within the represented reference slice."
  evaluated_sha: "f799ba7ae40f2b35ded9c8cbddde09d434274059"
  blueprint_digest: "6f75916310056c7bae2ae81f7bd36d887ffdb08c92197d823655e8702d349c26"
  evidence_refs:
    - ".agentplane/tasks/202611280908-EMZTQQ/README.md"
    - ".agentplane/tasks/202611280908-EMZTQQ/quality/20261128-092215545-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280908-EMZTQQ/quality/20261128-092215545-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280908-EMZTQQ/quality/20261128-092215545-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280908-EMZTQQ/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-label-odf-verification.md"
  findings:
    - "Both original shared formula label fixtures recalculate correctly. Worker and ODS preserve explicit label ranges and formula results with automatic label lookup disabled."
commit:
  hash: "f799ba7ae40f2b35ded9c8cbddde09d434274059"
  message: "🧩 EMZTQQ calc: preserve ODS label ranges and intersections"
comments:
  -
    author: "CODER"
    body: "Start: Align ODS label declaration addresses and deferred label ownership with pinned Calc. Verify pinned label formula fixtures and the Worker roundtrip."
  -
    author: "CODER"
    body: "Verified: 55 affected tests passed. TypeScript, scoped lint, module boundaries, provenance and Calc registry checks passed."
events:
  -
    type: "status"
    at: "2026-11-28T09:09:10.725Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Align ODS label declaration addresses and deferred label ownership with pinned Calc. Verify pinned label formula fixtures and the Worker roundtrip."
  -
    type: "verify"
    at: "2026-11-28T09:22:15.036Z"
    author: "CODER"
    state: "ok"
    note: "46 affected Calc tests and nine shared compiler tests passed. TypeScript, scoped ESLint, module boundaries, source provenance and Calc registry checks passed. The Calc registry reported zero semantic violations."
  -
    type: "status"
    at: "2026-11-28T09:23:30.709Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 55 affected tests passed. TypeScript, scoped lint, module boundaries, provenance and Calc registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-28T09:23:30.712Z"
doc_updated_by: "CODER"
description: "Port the native column and row label-range address conventions through ODS, preserve label pairs before names and formulas are restored through the Worker, and replay the pinned Calc shared-formula label fixtures."
sections:
  Summary: |-
    Align Calc ODS label-range interchange and formula resolution

    Port the native column and row label-range address conventions through ODS, preserve label pairs before names and formulas are restored through the Worker, and replay the pinned Calc shared-formula label fixtures.
  Scope: |-
    - In scope: Port the native column and row label-range address conventions through ODS, preserve label pairs before names and formulas are restored through the Worker, and replay the pinned Calc shared-formula label fixtures.
    - Out of scope: unrelated refactors not required for "Align Calc ODS label-range interchange and formula resolution".
  Plan: "Compare the pinned XML label range contexts and address converter, the label pair owner, Calc import sequencing, and the compiler. Reuse the native address and pair owners. Carry both ordered label lists through the Worker before compiling names and cell formulas. Replay both pinned shared-formula label fixtures and check an explicit row and column label with automatic lookup disabled through ODS and Worker. Run only affected test modules."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS label-range interchange and formula resolution". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS label-range interchange and formula resolution". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T09:22:15.036Z — VERIFY — ok

    By: CODER

    Note: 46 affected Calc tests and nine shared compiler tests passed. TypeScript, scoped ESLint, module boundaries, source provenance and Calc registry checks passed. The Calc registry reported zero semantic violations.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T09:09:10.725Z, excerpt_hash=sha256:5aef704b6b6c349e7fcb18e0fc6f4ca5f6ca762b9f4722833b7d60bb0293c61d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280908-EMZTQQ/blueprint/resolved-snapshot.json
    - old_digest: 6f75916310056c7bae2ae81f7bd36d887ffdb08c92197d823655e8702d349c26
    - current_digest: 6f75916310056c7bae2ae81f7bd36d887ffdb08c92197d823655e8702d349c26
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280908-EMZTQQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280908-EMZTQQ
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

Align Calc ODS label-range interchange and formula resolution

Port the native column and row label-range address conventions through ODS, preserve label pairs before names and formulas are restored through the Worker, and replay the pinned Calc shared-formula label fixtures.

## Scope

- In scope: Port the native column and row label-range address conventions through ODS, preserve label pairs before names and formulas are restored through the Worker, and replay the pinned Calc shared-formula label fixtures.
- Out of scope: unrelated refactors not required for "Align Calc ODS label-range interchange and formula resolution".

## Plan

Compare the pinned XML label range contexts and address converter, the label pair owner, Calc import sequencing, and the compiler. Reuse the native address and pair owners. Carry both ordered label lists through the Worker before compiling names and cell formulas. Replay both pinned shared-formula label fixtures and check an explicit row and column label with automatic lookup disabled through ODS and Worker. Run only affected test modules.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS label-range interchange and formula resolution". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS label-range interchange and formula resolution". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T09:22:15.036Z — VERIFY — ok

By: CODER

Note: 46 affected Calc tests and nine shared compiler tests passed. TypeScript, scoped ESLint, module boundaries, source provenance and Calc registry checks passed. The Calc registry reported zero semantic violations.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T09:09:10.725Z, excerpt_hash=sha256:5aef704b6b6c349e7fcb18e0fc6f4ca5f6ca762b9f4722833b7d60bb0293c61d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280908-EMZTQQ/blueprint/resolved-snapshot.json
- old_digest: 6f75916310056c7bae2ae81f7bd36d887ffdb08c92197d823655e8702d349c26
- current_digest: 6f75916310056c7bae2ae81f7bd36d887ffdb08c92197d823655e8702d349c26
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280908-EMZTQQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280908-EMZTQQ
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
