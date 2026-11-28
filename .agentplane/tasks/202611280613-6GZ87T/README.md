---
id: "202611280613-6GZ87T"
title: "Restore deterministic Writer ODT embedded-font boundary verification"
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
  updated_at: "2026-11-28T06:13:54.879Z"
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
    body: "Start: full-checkpoint Writer font byte assertion reproduced on main."
events:
  -
    type: "status"
    at: "2026-11-28T06:13:56.820Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: full-checkpoint Writer font byte assertion reproduced on main."
doc_version: 3
doc_updated_at: "2026-11-28T06:13:56.820Z"
doc_updated_by: "CODER"
description: "Reproduce the full-suite failure on the native embedded font fixture. Validate full package bytes for typed and textual inputs across browser and Node typed-array realms. Preserve the actual import behavior and verify adjacent ODF font coverage."
sections:
  Summary: |-
    Restore deterministic Writer ODT embedded-font boundary verification

    Reproduce the full-suite failure on the native embedded font fixture. Validate full package bytes for typed and textual inputs across browser and Node typed-array realms. Preserve the actual import behavior and verify adjacent ODF font coverage.
  Scope: |-
    - In scope: Reproduce the full-suite failure on the native embedded font fixture. Validate full package bytes for typed and textual inputs across browser and Node typed-array realms. Preserve the actual import behavior and verify adjacent ODF font coverage.
    - Out of scope: unrelated refactors not required for "Restore deterministic Writer ODT embedded-font boundary verification".
  Plan: "Confirm byte equality across Node and DOM typed-array realms using the original unrestricted font fixture and the failing full-checkpoint assertion. Compare actual owned package bytes with the bytes encoded from the textual resource, preserving the ordinary typed and missing-entry checks. Run the affected Writer XML, embedded-font and font-input tests and related Calc/package font tests. Preserve native resource handling and existing browser file choices. Record the full pin failure and the focused repair; continue upstream parity work without a pause."
  Verify Steps: |-
    PLANNER fallback scaffold for "Restore deterministic Writer ODT embedded-font boundary verification". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Restore deterministic Writer ODT embedded-font boundary verification". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Restore deterministic Writer ODT embedded-font boundary verification

Reproduce the full-suite failure on the native embedded font fixture. Validate full package bytes for typed and textual inputs across browser and Node typed-array realms. Preserve the actual import behavior and verify adjacent ODF font coverage.

## Scope

- In scope: Reproduce the full-suite failure on the native embedded font fixture. Validate full package bytes for typed and textual inputs across browser and Node typed-array realms. Preserve the actual import behavior and verify adjacent ODF font coverage.
- Out of scope: unrelated refactors not required for "Restore deterministic Writer ODT embedded-font boundary verification".

## Plan

Confirm byte equality across Node and DOM typed-array realms using the original unrestricted font fixture and the failing full-checkpoint assertion. Compare actual owned package bytes with the bytes encoded from the textual resource, preserving the ordinary typed and missing-entry checks. Run the affected Writer XML, embedded-font and font-input tests and related Calc/package font tests. Preserve native resource handling and existing browser file choices. Record the full pin failure and the focused repair; continue upstream parity work without a pause.

## Verify Steps

PLANNER fallback scaffold for "Restore deterministic Writer ODT embedded-font boundary verification". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Restore deterministic Writer ODT embedded-font boundary verification". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
