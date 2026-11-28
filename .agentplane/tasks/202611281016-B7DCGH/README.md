---
id: "202611281016-B7DCGH"
title: "Align Calc ODS formula result caches and volatile load recalculation"
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
  updated_at: "2026-11-28T10:16:14.259Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T10:25:34.763Z"
  updated_by: "CODER"
  note: "Passed 22 targeted Calc and 12 shared compiler/token tests. The unchanged cachedValue, hybrid shared-string and matrix ODS fixtures passed. TypeScript, scoped ESLint, dependency rules, provenance and Calc inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T10:25:35.221Z"
  updated_by: "EVALUATOR"
  note: "Pinned ODS caches and volatile dependency recalculation follow the represented Calc load semantics."
  evaluated_sha: "b817eb068107cca626b61211155512d631d5e6ec"
  blueprint_digest: "408c4be656f75ba4b605dbd0dbabb252565f20ac57315999ed128be68a006394"
  evidence_refs:
    - ".agentplane/tasks/202611281016-B7DCGH/README.md"
    - ".agentplane/tasks/202611281016-B7DCGH/quality/20261128-102535221-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611281016-B7DCGH/quality/20261128-102535221-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611281016-B7DCGH/quality/20261128-102535221-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611281016-B7DCGH/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-formula-cache-verification.md"
  findings:
    - "The ODS packages and Worker retain current datetime formats, typed errors and cached matrix results; focused gates passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align cached formula results and the native Calc volatile load pass."
events:
  -
    type: "status"
    at: "2026-11-28T10:16:14.654Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align cached formula results and the native Calc volatile load pass."
  -
    type: "verify"
    at: "2026-11-28T10:25:34.763Z"
    author: "CODER"
    state: "ok"
    note: "Passed 22 targeted Calc and 12 shared compiler/token tests. The unchanged cachedValue, hybrid shared-string and matrix ODS fixtures passed. TypeScript, scoped ESLint, dependency rules, provenance and Calc inventory passed."
doc_version: 3
doc_updated_at: "2026-11-28T10:25:34.817Z"
doc_updated_by: "CODER"
description: "Align native ODS formula-result cache admission and volatile recalc after package load. Implement represented time and random volatility, propagate invalidation through existing listener owners and preserve scalar, shared string, formatted and matrix caches. Replay the pinned cachedValue and hybrid shared string cases with focused Calc checks."
sections:
  Summary: |-
    Align Calc ODS formula result caches and volatile load recalculation

    Align native ODS formula-result cache admission and volatile recalc after package load. Implement represented time and random volatility, propagate invalidation through existing listener owners and preserve scalar, shared string, formatted and matrix caches. Replay the pinned cachedValue and hybrid shared string cases with focused Calc checks.
  Scope: |-
    - In scope: Align native ODS formula-result cache admission and volatile recalc after package load. Implement represented time and random volatility, propagate invalidation through existing listener owners and preserve scalar, shared string, formatted and matrix caches. Replay the pinned cachedValue and hybrid shared string cases with focused Calc checks.
    - Out of scope: unrelated refactors not required for "Align Calc ODS formula result caches and volatile load recalculation".
  Plan: "Compare native cached scalar and matrix import, compiler recalc modes and ScDocShell volatile broadcast. Restore represented time and random operator execution and load-time invalidation through actual listener owners. Preserve clean formula caches and typed error/result propagation across ODS and the Worker. Replay the applicable pinned cachedValue, hybrid-shared-string and matrix fixture assertions, then run only focused Calc and affected shared compiler tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS formula result caches and volatile load recalculation". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS formula result caches and volatile load recalculation". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T10:25:34.763Z — VERIFY — ok

    By: CODER

    Note: Passed 22 targeted Calc and 12 shared compiler/token tests. The unchanged cachedValue, hybrid shared-string and matrix ODS fixtures passed. TypeScript, scoped ESLint, dependency rules, provenance and Calc inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:16:14.654Z, excerpt_hash=sha256:145e6759fdb586c2e918c74c9b2b863cc22592ab080cd74481915e88447166f1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281016-B7DCGH/blueprint/resolved-snapshot.json
    - old_digest: 408c4be656f75ba4b605dbd0dbabb252565f20ac57315999ed128be68a006394
    - current_digest: 408c4be656f75ba4b605dbd0dbabb252565f20ac57315999ed128be68a006394
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281016-B7DCGH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281016-B7DCGH
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

Align Calc ODS formula result caches and volatile load recalculation

Align native ODS formula-result cache admission and volatile recalc after package load. Implement represented time and random volatility, propagate invalidation through existing listener owners and preserve scalar, shared string, formatted and matrix caches. Replay the pinned cachedValue and hybrid shared string cases with focused Calc checks.

## Scope

- In scope: Align native ODS formula-result cache admission and volatile recalc after package load. Implement represented time and random volatility, propagate invalidation through existing listener owners and preserve scalar, shared string, formatted and matrix caches. Replay the pinned cachedValue and hybrid shared string cases with focused Calc checks.
- Out of scope: unrelated refactors not required for "Align Calc ODS formula result caches and volatile load recalculation".

## Plan

Compare native cached scalar and matrix import, compiler recalc modes and ScDocShell volatile broadcast. Restore represented time and random operator execution and load-time invalidation through actual listener owners. Preserve clean formula caches and typed error/result propagation across ODS and the Worker. Replay the applicable pinned cachedValue, hybrid-shared-string and matrix fixture assertions, then run only focused Calc and affected shared compiler tests.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS formula result caches and volatile load recalculation". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS formula result caches and volatile load recalculation". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T10:25:34.763Z — VERIFY — ok

By: CODER

Note: Passed 22 targeted Calc and 12 shared compiler/token tests. The unchanged cachedValue, hybrid shared-string and matrix ODS fixtures passed. TypeScript, scoped ESLint, dependency rules, provenance and Calc inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:16:14.654Z, excerpt_hash=sha256:145e6759fdb586c2e918c74c9b2b863cc22592ab080cd74481915e88447166f1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281016-B7DCGH/blueprint/resolved-snapshot.json
- old_digest: 408c4be656f75ba4b605dbd0dbabb252565f20ac57315999ed128be68a006394
- current_digest: 408c4be656f75ba4b605dbd0dbabb252565f20ac57315999ed128be68a006394
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281016-B7DCGH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281016-B7DCGH
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
