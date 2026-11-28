---
id: "202611281016-B7DCGH"
title: "Align Calc ODS formula result caches and volatile load recalculation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-11-28T10:16:14.654Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
