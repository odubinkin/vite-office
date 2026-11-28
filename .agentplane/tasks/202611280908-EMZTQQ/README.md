---
id: "202611280908-EMZTQQ"
title: "Align Calc ODS label-range interchange and formula resolution"
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
  updated_at: "2026-11-28T09:09:08.127Z"
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
    body: "Start: Align ODS label declaration addresses and deferred label ownership with pinned Calc. Verify pinned label formula fixtures and the Worker roundtrip."
events:
  -
    type: "status"
    at: "2026-11-28T09:09:10.725Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Align ODS label declaration addresses and deferred label ownership with pinned Calc. Verify pinned label formula fixtures and the Worker roundtrip."
doc_version: 3
doc_updated_at: "2026-11-28T09:09:10.725Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
