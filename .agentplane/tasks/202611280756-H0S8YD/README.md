---
id: "202611280756-H0S8YD"
title: "Port Writer ODT page numbers and continuation fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  updated_at: "2026-11-28T07:57:09.100Z"
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
    body: "Start: port the original page descriptor numbering property and attached page-number/continuation lifecycle."
events:
  -
    type: "status"
    at: "2026-11-28T07:57:10.241Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the original page descriptor numbering property and attached page-number/continuation lifecycle."
doc_version: 3
doc_updated_at: "2026-11-28T07:57:10.241Z"
doc_updated_by: "CODER"
description: "Preserve page-layout numbering types, native PageNumber and page-continuation fields, their relative page selection and offset, layout-backed values within the current Writer page frame slice, and Worker transfer."
sections:
  Summary: |-
    Port Writer ODT page numbers and continuation fields

    Preserve page-layout numbering types, native PageNumber and page-continuation fields, their relative page selection and offset, layout-backed values within the current Writer page frame slice, and Worker transfer.
  Scope: |-
    - In scope: Preserve page-layout numbering types, native PageNumber and page-continuation fields, their relative page selection and offset, layout-backed values within the current Writer page frame slice, and Worker transfer.
    - Out of scope: unrelated refactors not required for "Port Writer ODT page numbers and continuation fields".
  Plan: "Follow pinned SwPageNumberField, UNO PageNumberType, XML page field contexts and PageMaster NumberingType property. Port the page descriptor numbering owner and typed page-number/continuation ODT fields with Worker state and expansion from represented physical and virtual page frames. Verify original ODT fixture field identity and a critical relative selection, continuation and numbering round trip. Run associated Writer tests and static checks; keep file-management and recovery deviations."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Writer ODT page numbers and continuation fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Writer ODT page numbers and continuation fields". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port Writer ODT page numbers and continuation fields

Preserve page-layout numbering types, native PageNumber and page-continuation fields, their relative page selection and offset, layout-backed values within the current Writer page frame slice, and Worker transfer.

## Scope

- In scope: Preserve page-layout numbering types, native PageNumber and page-continuation fields, their relative page selection and offset, layout-backed values within the current Writer page frame slice, and Worker transfer.
- Out of scope: unrelated refactors not required for "Port Writer ODT page numbers and continuation fields".

## Plan

Follow pinned SwPageNumberField, UNO PageNumberType, XML page field contexts and PageMaster NumberingType property. Port the page descriptor numbering owner and typed page-number/continuation ODT fields with Worker state and expansion from represented physical and virtual page frames. Verify original ODT fixture field identity and a critical relative selection, continuation and numbering round trip. Run associated Writer tests and static checks; keep file-management and recovery deviations.

## Verify Steps

PLANNER fallback scaffold for "Port Writer ODT page numbers and continuation fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Writer ODT page numbers and continuation fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
