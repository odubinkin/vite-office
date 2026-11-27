---
id: "202611271749-66G2T0"
title: "Preserve native Calc sheet writing direction in ODS"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port the native Calc ODS sheet writing direction and deferred load contract."
events:
  -
    type: "status"
    at: "2026-11-27T17:50:06.402Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the native Calc ODS sheet writing direction and deferred load contract."
doc_version: 3
doc_updated_at: "2026-11-27T17:50:06.402Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
