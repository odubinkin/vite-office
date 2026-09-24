---
id: "202609240501-81449V"
title: "Restore list selection undo and transfer invariants"
status: "TODO"
priority: "med"
owner: "CODER"
revision: 1
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
comments: []
events: []
doc_version: 3
doc_updated_at: "2026-09-24T05:01:34.583Z"
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
    1. Implement the change for "Restore list selection undo and transfer invariants".
    2. Run required checks and capture verification evidence.
    3. Finalize task findings and finish with traceable commit metadata.
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Run `npm run verify`. Expected: it succeeds and confirms the requested outcome for this task.
    2. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    3. Compare the final result against the task summary and touched scope. Expected: remaining follow-up is either resolved or explicit in ## Findings.
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

1. Implement the change for "Restore list selection undo and transfer invariants".
2. Run required checks and capture verification evidence.
3. Finalize task findings and finish with traceable commit metadata.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Run `npm run verify`. Expected: it succeeds and confirms the requested outcome for this task.
2. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
3. Compare the final result against the task summary and touched scope. Expected: remaining follow-up is either resolved or explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
