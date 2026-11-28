---
id: "202611281115-6T6XDX"
title: "Align Calc ODS scalar error predicates and fallback branches with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  updated_at: "2026-11-28T11:15:22.747Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T12:50:42.490Z"
  updated_by: "CODER"
  note: "44 focused Calc and shared tests across eight files, TypeScript, lint, module boundaries, provenance and inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T12:50:43.438Z"
  updated_by: "EVALUATOR"
  note: "Scalar error predicates and lazy IFERROR and IFNA branches follow the native ODS formula path."
  evaluated_sha: "25641d9936084d25965d276462ab2205d459603f"
  blueprint_digest: "9cc576913ccb3d2f6b7f3a7b52734a8ec9f7366d75282188f533e678cda50f86"
  evidence_refs:
    - ".agentplane/tasks/202611281115-6T6XDX/README.md"
    - ".agentplane/tasks/202611281115-6T6XDX/quality/20261128-125043438-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611281115-6T6XDX/quality/20261128-125043438-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611281115-6T6XDX/quality/20261128-125043438-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611281115-6T6XDX/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-error-fallback-verification.md"
  findings:
    - "Replayed upstream scalar cases through Worker and ODS reopen. Documented the omitted-operand fixture discrepancy."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement native scalar error predicates and conditional error fallbacks."
events:
  -
    type: "status"
    at: "2026-11-28T11:15:23.106Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native scalar error predicates and conditional error fallbacks."
  -
    type: "verify"
    at: "2026-11-28T12:50:42.490Z"
    author: "CODER"
    state: "ok"
    note: "44 focused Calc and shared tests across eight files, TypeScript, lint, module boundaries, provenance and inventory passed."
doc_version: 3
doc_updated_at: "2026-11-28T12:50:42.639Z"
doc_updated_by: "CODER"
description: "Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks."
sections:
  Summary: |-
    Align Calc ODS scalar error predicates and fallback branches with LibreOffice

    Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.
  Scope: |-
    - In scope: Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.
    - Out of scope: unrelated refactors not required for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice".
  Plan: "Extend native formula resources and jump compilation for IFERROR and IFNA, and scalar error classification for ISERROR, ISERR and ISNA. Follow upstream interpreter stack-base and error-function continuation semantics for represented scalar and reference results. Test native lazy fallback and error/value type behavior through ODS recalculation and Worker/save/reopen. Replay pinned TestFormula2 scalar checks and applicable information-function assertions. Matrix jump lifting remains a separate responsibility."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T12:50:42.490Z — VERIFY — ok

    By: CODER

    Note: 44 focused Calc and shared tests across eight files, TypeScript, lint, module boundaries, provenance and inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T11:15:23.106Z, excerpt_hash=sha256:6c4c881dd8e07711e163569dcc26079441a563ba757798e863b3d1f4e776f0e1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281115-6T6XDX/blueprint/resolved-snapshot.json
    - old_digest: 9cc576913ccb3d2f6b7f3a7b52734a8ec9f7366d75282188f533e678cda50f86
    - current_digest: 9cc576913ccb3d2f6b7f3a7b52734a8ec9f7366d75282188f533e678cda50f86
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281115-6T6XDX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281115-6T6XDX
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

Align Calc ODS scalar error predicates and fallback branches with LibreOffice

Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.

## Scope

- In scope: Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.
- Out of scope: unrelated refactors not required for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice".

## Plan

Extend native formula resources and jump compilation for IFERROR and IFNA, and scalar error classification for ISERROR, ISERR and ISNA. Follow upstream interpreter stack-base and error-function continuation semantics for represented scalar and reference results. Test native lazy fallback and error/value type behavior through ODS recalculation and Worker/save/reopen. Replay pinned TestFormula2 scalar checks and applicable information-function assertions. Matrix jump lifting remains a separate responsibility.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T12:50:42.490Z — VERIFY — ok

By: CODER

Note: 44 focused Calc and shared tests across eight files, TypeScript, lint, module boundaries, provenance and inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T11:15:23.106Z, excerpt_hash=sha256:6c4c881dd8e07711e163569dcc26079441a563ba757798e863b3d1f4e776f0e1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281115-6T6XDX/blueprint/resolved-snapshot.json
- old_digest: 9cc576913ccb3d2f6b7f3a7b52734a8ec9f7366d75282188f533e678cda50f86
- current_digest: 9cc576913ccb3d2f6b7f3a7b52734a8ec9f7366d75282188f533e678cda50f86
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281115-6T6XDX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281115-6T6XDX
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
