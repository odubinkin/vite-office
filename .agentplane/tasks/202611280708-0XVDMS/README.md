---
id: "202611280708-0XVDMS"
title: "Port Calc ODS loaded deletion and movement actions"
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
  updated_at: "2026-11-28T07:09:15.917Z"
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
    body: "Start: port original loaded deletion and movement ownership, generated cells and cutoffs."
events:
  -
    type: "status"
    at: "2026-11-28T07:09:17.069Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original loaded deletion and movement ownership, generated cells and cutoffs."
doc_version: 3
doc_updated_at: "2026-11-28T07:09:17.069Z"
doc_updated_by: "CODER"
description: "Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history."
sections:
  Summary: |-
    Port Calc ODS loaded deletion and movement actions

    Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.
  Scope: |-
    - In scope: Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.
    - Out of scope: unrelated refactors not required for "Port Calc ODS loaded deletion and movement actions".
  Plan: "Port the loaded native deletion and movement action families with whole-axis or source/target range ownership and original deletion offsets, linked deleted actions, generated cell snapshots and insertion/movement cutoffs. Use original multi-pass hydration and serialize the same dependencies through ODS and Worker, preserving the existing rejection dispatch and unaffected workbook state. Verify the existing tracking, print and Worker suites and one critical package roundtrip. Document suspicious pinned behavior. Leave interactive tracking and accept/reject commands outside this serialization task."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Calc ODS loaded deletion and movement actions". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Calc ODS loaded deletion and movement actions". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port Calc ODS loaded deletion and movement actions

Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.

## Scope

- In scope: Implement original ODS sheet deletion and movement records, whole-axis and source/target ranges, multi-deletion offsets, deleted links, generated cell snapshots and cutoff records through the native Calc tracker and Worker. Preserve Workbook values while restoring history.
- Out of scope: unrelated refactors not required for "Port Calc ODS loaded deletion and movement actions".

## Plan

Port the loaded native deletion and movement action families with whole-axis or source/target range ownership and original deletion offsets, linked deleted actions, generated cell snapshots and insertion/movement cutoffs. Use original multi-pass hydration and serialize the same dependencies through ODS and Worker, preserving the existing rejection dispatch and unaffected workbook state. Verify the existing tracking, print and Worker suites and one critical package roundtrip. Document suspicious pinned behavior. Leave interactive tracking and accept/reject commands outside this serialization task.

## Verify Steps

PLANNER fallback scaffold for "Port Calc ODS loaded deletion and movement actions". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Calc ODS loaded deletion and movement actions". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
