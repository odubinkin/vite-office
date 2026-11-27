---
id: "202611271525-JB5J7E"
title: "Restore Calc native subtotal registration and AutoSum"
result_summary: "Complete native subtotal registration and filtered AutoSum."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
  - "subtotal"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T15:25:26.512Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T15:34:45.597Z"
  updated_by: "CODER"
  note: "The 43 controller and formula tests and 41 ODS and formula lifecycle tests passed. The original autosum.ods values survive ODS and Worker. Focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T15:34:46.262Z"
  updated_by: "EVALUATOR"
  note: "The native subtotal owner registers formula cells, invalidates by actual reference range and produces filtered AutoSum formulas from the original ODS case."
  evaluated_sha: "a8ab58df230b0c221797b1815ff9e372d34c2f74"
  blueprint_digest: "62afa97aaa46ea4b42b497063879b2dc3f37f31cc72552f37f16a82ce65333f9"
  evidence_refs:
    - ".agentplane/tasks/202611271525-JB5J7E/README.md"
    - ".agentplane/tasks/202611271525-JB5J7E/quality/20261127-153446262-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271525-JB5J7E/quality/20261127-153446262-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271525-JB5J7E/quality/20261127-153446262-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271525-JB5J7E/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/odf-subtotal-followup/verification.md"
    - "a8ab58df230b0c221797b1815ff9e372d34c2f74"
  findings:
    - "The immutable checkpoint failure was an obsolete constructor rejection. Calc preserves the pinned fixed range selection offset in CALC-870."
commit:
  hash: "a8ab58df230b0c221797b1815ff9e372d34c2f74"
  message: "🧩 JB5J7E calc: complete native subtotal registration and AutoSum"
comments:
  -
    author: "CODER"
    body: "Start: Repair the confirmed full-checkpoint subtotal assertion through the pinned formula owner, document registry and AutoSum contracts."
  -
    author: "CODER"
    body: "Verified: Calc registers native subtotal formulas, recalculates affected references and preserves the original AutoSum subtotals through the Worker and ODS."
events:
  -
    type: "status"
    at: "2026-11-27T15:25:27.565Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Repair the confirmed full-checkpoint subtotal assertion through the pinned formula owner, document registry and AutoSum contracts."
  -
    type: "verify"
    at: "2026-11-27T15:34:45.597Z"
    author: "CODER"
    state: "ok"
    note: "The 43 controller and formula tests and 41 ODS and formula lifecycle tests passed. The original autosum.ods values survive ODS and Worker. Focused static, dependency, provenance and registry checks passed."
  -
    type: "status"
    at: "2026-11-27T15:36:18.349Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Calc registers native subtotal formulas, recalculates affected references and preserves the original AutoSum subtotals through the Worker and ODS."
doc_version: 3
doc_updated_at: "2026-11-27T15:36:18.350Z"
doc_updated_by: "CODER"
description: "Connect the represented subtotal formula calculation to native document registration, reference-based invalidation and the filtered AutoSum path. Preserve the original Calc token, group and ODS Worker owners. Update outdated subtotal admission assertions revealed by the full checkpoint and run related Calc tests."
sections:
  Summary: |-
    Restore Calc native subtotal registration and AutoSum

    Connect the represented subtotal formula calculation to native document registration, reference-based invalidation and the filtered AutoSum path. Preserve the original Calc token, group and ODS Worker owners. Update outdated subtotal admission assertions revealed by the full checkpoint and run related Calc tests.
  Scope: |-
    - In scope: Connect the represented subtotal formula calculation to native document registration, reference-based invalidation and the filtered AutoSum path. Preserve the original Calc token, group and ODS Worker owners. Update outdated subtotal admission assertions revealed by the full checkpoint and run related Calc tests.
    - Out of scope: unrelated refactors not required for "Restore Calc native subtotal registration and AutoSum".
  Plan: "Follow pinned ScFormulaCell and ScDocument subtotal registration and cleanup, ScDetectiveRefIter reference-range invalidation, and ScViewFunc GetSubTotal/GetAutoSumFormula with ScInputWindow range selection. Connect exactly the represented subtotal and aggregate registration and ordinary filtered SUM creation. Preserve independent filtered destination limitations and leave unrelated formula evaluation, saved-file identity and browser lifecycle unchanged. Correct obsolete expected failures and prove matching ODS round-trip and filter-sensitive recalculation in existing focused tests, adding a critical fixture only where necessary."
  Verify Steps: |-
    PLANNER fallback scaffold for "Restore Calc native subtotal registration and AutoSum". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Restore Calc native subtotal registration and AutoSum". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T15:34:45.597Z — VERIFY — ok

    By: CODER

    Note: The 43 controller and formula tests and 41 ODS and formula lifecycle tests passed. The original autosum.ods values survive ODS and Worker. Focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T15:25:27.565Z, excerpt_hash=sha256:33e843991f4f1adeaeee60d3229957008a56285274c8bb75354c2fc502e2711f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271525-JB5J7E/blueprint/resolved-snapshot.json
    - old_digest: 62afa97aaa46ea4b42b497063879b2dc3f37f31cc72552f37f16a82ce65333f9
    - current_digest: 62afa97aaa46ea4b42b497063879b2dc3f37f31cc72552f37f16a82ce65333f9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271525-JB5J7E

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271525-JB5J7E
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

Restore Calc native subtotal registration and AutoSum

Connect the represented subtotal formula calculation to native document registration, reference-based invalidation and the filtered AutoSum path. Preserve the original Calc token, group and ODS Worker owners. Update outdated subtotal admission assertions revealed by the full checkpoint and run related Calc tests.

## Scope

- In scope: Connect the represented subtotal formula calculation to native document registration, reference-based invalidation and the filtered AutoSum path. Preserve the original Calc token, group and ODS Worker owners. Update outdated subtotal admission assertions revealed by the full checkpoint and run related Calc tests.
- Out of scope: unrelated refactors not required for "Restore Calc native subtotal registration and AutoSum".

## Plan

Follow pinned ScFormulaCell and ScDocument subtotal registration and cleanup, ScDetectiveRefIter reference-range invalidation, and ScViewFunc GetSubTotal/GetAutoSumFormula with ScInputWindow range selection. Connect exactly the represented subtotal and aggregate registration and ordinary filtered SUM creation. Preserve independent filtered destination limitations and leave unrelated formula evaluation, saved-file identity and browser lifecycle unchanged. Correct obsolete expected failures and prove matching ODS round-trip and filter-sensitive recalculation in existing focused tests, adding a critical fixture only where necessary.

## Verify Steps

PLANNER fallback scaffold for "Restore Calc native subtotal registration and AutoSum". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Restore Calc native subtotal registration and AutoSum". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T15:34:45.597Z — VERIFY — ok

By: CODER

Note: The 43 controller and formula tests and 41 ODS and formula lifecycle tests passed. The original autosum.ods values survive ODS and Worker. Focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T15:25:27.565Z, excerpt_hash=sha256:33e843991f4f1adeaeee60d3229957008a56285274c8bb75354c2fc502e2711f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271525-JB5J7E/blueprint/resolved-snapshot.json
- old_digest: 62afa97aaa46ea4b42b497063879b2dc3f37f31cc72552f37f16a82ce65333f9
- current_digest: 62afa97aaa46ea4b42b497063879b2dc3f37f31cc72552f37f16a82ce65333f9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271525-JB5J7E

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271525-JB5J7E
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
