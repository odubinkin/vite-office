---
id: "202609240542-9D8VFJ"
title: "Restore document-owned Writer line numbering"
status: "TODO"
priority: "med"
owner: "CODER"
revision: 1
origin:
  system: "manual"
depends_on:
  - "202609240501-76PKPC"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
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
doc_updated_at: "2026-09-24T05:42:14.887Z"
doc_updated_by: "CODER"
description: "Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only"
sections:
  Summary: |-
    Restore document-owned Writer line numbering

    Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only
  Scope: |-
    - In scope: Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only.
    - Out of scope: unrelated refactors not required for "Restore document-owned Writer line numbering".
  Plan: |-
    1. Implement the change for "Restore document-owned Writer line numbering".
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

Restore document-owned Writer line numbering

Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only

## Scope

- In scope: Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only.
- Out of scope: unrelated refactors not required for "Restore document-owned Writer line numbering".

## Plan

1. Implement the change for "Restore document-owned Writer line numbering".
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
