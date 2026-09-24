---
id: "202609240501-81449V"
title: "Restore list selection undo and transfer invariants"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609231700-TZMGXV"
  - "202609240501-K41WJD"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T07:50:38.861Z"
  updated_by: "ORCHESTRATOR"
  note: "Approved as the Stage 5 work unit within the user-approved upstream parity plan."
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
    body: "Start: audit reachable list, selection, undo and transfer invariants against pinned LibreOffice and repair source-backed mismatches."
events:
  -
    type: "status"
    at: "2026-09-24T07:50:43.455Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit reachable list, selection, undo and transfer invariants against pinned LibreOffice and repair source-backed mismatches."
doc_version: 3
doc_updated_at: "2026-09-24T07:50:43.455Z"
doc_updated_by: "CODER"
description: "Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task"
sections:
  Summary: |-
    Restore list selection undo and transfer invariants

    Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task
  Scope: |-
    - In scope: Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task.
    - Out of scope: unrelated refactors not required for "Restore list selection undo and transfer invariants".
  Plan: |-
    1. Inventory currently reachable list, PaM, text-node, undo and transfer operations from the Writer command slice and compare their item/position invariants with the pinned sw/source/core and sw/source/uibase sources. Reuse the already landed SwTransferable ownership work.
    2. Repair only demonstrated contract differences in matching upstream-shaped model or shell modules; keep DOM, Clipboard API and React projections in browser modules. Preserve supported split, merge, list restart, selected-range, copy/paste and undo behavior.
    3. Add operation-level source-backed tests for any repaired edge cases and update runtime inventory, command parity and provenance data without claiming unsupported native features.
    4. Run focused suites and npm run verify; review the task-scoped diff, record verification and evaluator evidence, then finish with a clean tracked checkout.
  Verify Steps: |-
    1. For each changed list, PaM, text-node, undo or transfer operation, identify a pinned upstream source/symbol and an assertion that checks the same reachable contract; keep unsupported structures explicit.
    2. Exercise list split/merge/restart, direction-preserving cross-paragraph selection, copy/cut/paste, and undo/redo where the approved audit finds a mismatch. Canonical SwDoc nodes, positions and pooled items must survive these transitions; browser DTOs remain projections.
    3. Existing transfer paths still pass focused SwTransferable, browser edit-window, workflow and clipboard tests. No storage, save schedule or recovery behavior changes.
    4. Update existing inventory/provenance data accurately; npm run verify passes, and the task-scoped diff and final tracked state are clean.
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

Restore list selection undo and transfer invariants

Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task

## Scope

- In scope: Stage 5: verify and repair reachable list, PaM, text node, undo and clipboard transitions against pinned Writer source; respect active transfer task.
- Out of scope: unrelated refactors not required for "Restore list selection undo and transfer invariants".

## Plan

1. Inventory currently reachable list, PaM, text-node, undo and transfer operations from the Writer command slice and compare their item/position invariants with the pinned sw/source/core and sw/source/uibase sources. Reuse the already landed SwTransferable ownership work.
2. Repair only demonstrated contract differences in matching upstream-shaped model or shell modules; keep DOM, Clipboard API and React projections in browser modules. Preserve supported split, merge, list restart, selected-range, copy/paste and undo behavior.
3. Add operation-level source-backed tests for any repaired edge cases and update runtime inventory, command parity and provenance data without claiming unsupported native features.
4. Run focused suites and npm run verify; review the task-scoped diff, record verification and evaluator evidence, then finish with a clean tracked checkout.

## Verify Steps

1. For each changed list, PaM, text-node, undo or transfer operation, identify a pinned upstream source/symbol and an assertion that checks the same reachable contract; keep unsupported structures explicit.
2. Exercise list split/merge/restart, direction-preserving cross-paragraph selection, copy/cut/paste, and undo/redo where the approved audit finds a mismatch. Canonical SwDoc nodes, positions and pooled items must survive these transitions; browser DTOs remain projections.
3. Existing transfer paths still pass focused SwTransferable, browser edit-window, workflow and clipboard tests. No storage, save schedule or recovery behavior changes.
4. Update existing inventory/provenance data accurately; npm run verify passes, and the task-scoped diff and final tracked state are clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
