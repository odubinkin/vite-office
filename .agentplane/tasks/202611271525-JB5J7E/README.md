---
id: "202611271525-JB5J7E"
title: "Restore Calc native subtotal registration and AutoSum"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Repair the confirmed full-checkpoint subtotal assertion through the pinned formula owner, document registry and AutoSum contracts."
events:
  -
    type: "status"
    at: "2026-11-27T15:25:27.565Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Repair the confirmed full-checkpoint subtotal assertion through the pinned formula owner, document registry and AutoSum contracts."
doc_version: 3
doc_updated_at: "2026-11-27T15:25:27.565Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
