---
id: "202611271009-SD68YQ"
title: "Reconcile Calc and Writer expectations from the ODF checkpoint"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odf"
  - "verification"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T10:10:12.945Z"
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
    body: "Start: Reconcile completed checkpoint failures with the pinned product contracts."
events:
  -
    type: "status"
    at: "2026-11-27T10:10:13.810Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Reconcile completed checkpoint failures with the pinned product contracts."
doc_version: 3
doc_updated_at: "2026-11-27T10:10:13.810Z"
doc_updated_by: "CODER"
description: "Correct the stale Calc PODF and Writer paragraph/ODF alignment expectations found by the complete Office test run. Retain the native product behavior and re-run the affected test owners."
sections:
  Summary: |-
    Reconcile Calc and Writer expectations from the ODF checkpoint

    Correct the stale Calc PODF and Writer paragraph/ODF alignment expectations found by the complete Office test run. Retain the native product behavior and re-run the affected test owners.
  Scope: |-
    - In scope: Correct the stale Calc PODF and Writer paragraph/ODF alignment expectations found by the complete Office test run. Retain the native product behavior and re-run the affected test owners.
    - Out of scope: unrelated refactors not required for "Reconcile Calc and Writer expectations from the ODF checkpoint".
  Plan: "Use the completed Office report to reconcile outdated Calc PODF, Writer alignment and browser projection, toolbar, and shared numbering fallback assertions with pinned owners. Re-run all failed files, including the Calc worker startup timeout, and account for each in the checkpoint report."
  Verify Steps: "Replay the original failed Calc and Writer files serially by project. Validate affected lint and format, source-backed expected alignment and toolbar order, and git diff checks."
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

Reconcile Calc and Writer expectations from the ODF checkpoint

Correct the stale Calc PODF and Writer paragraph/ODF alignment expectations found by the complete Office test run. Retain the native product behavior and re-run the affected test owners.

## Scope

- In scope: Correct the stale Calc PODF and Writer paragraph/ODF alignment expectations found by the complete Office test run. Retain the native product behavior and re-run the affected test owners.
- Out of scope: unrelated refactors not required for "Reconcile Calc and Writer expectations from the ODF checkpoint".

## Plan

Use the completed Office report to reconcile outdated Calc PODF, Writer alignment and browser projection, toolbar, and shared numbering fallback assertions with pinned owners. Re-run all failed files, including the Calc worker startup timeout, and account for each in the checkpoint report.

## Verify Steps

Replay the original failed Calc and Writer files serially by project. Validate affected lint and format, source-backed expected alignment and toolbar order, and git diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
