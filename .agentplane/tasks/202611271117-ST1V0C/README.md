---
id: "202611271117-ST1V0C"
title: "Check native Protect Sheet state in the Calc browser menu"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "verification"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:17:50.126Z"
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
    body: "Start: check the original Protect Sheet entry in the existing browser acceptance."
events:
  -
    type: "status"
    at: "2026-11-27T11:17:50.764Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: check the original Protect Sheet entry in the existing browser acceptance."
doc_version: 3
doc_updated_at: "2026-11-27T11:17:50.764Z"
doc_updated_by: "CODER"
description: "Reconcile the sheet context menu tests with the existing native Protect Sheet checkbox and verify menu focus, selection, geometry and accessibility at both original widths."
sections:
  Summary: |-
    Check native Protect Sheet state in the Calc browser menu

    Reconcile the sheet context menu tests with the existing native Protect Sheet checkbox and verify menu focus, selection, geometry and accessibility at both original widths.
  Scope: |-
    - In scope: Reconcile the sheet context menu tests with the existing native Protect Sheet checkbox and verify menu focus, selection, geometry and accessibility at both original widths.
    - Out of scope: unrelated refactors not required for "Check native Protect Sheet state in the Calc browser menu".
  Plan: "1. Confirm the missing checkbox expectation using the failure traces and pinned sheet-tab popup resource. 2. Assert that Protect Sheet is visible and unchecked on the fresh unprotected sheet. 3. Replay both existing width variants on the checkpoint build."
  Verify Steps: "Replay both existing sheet context menu width variants against the running checkpoint, preserving focus, selection, geometry, accessibility and Undo assertions. Run focused lint, formatting, replay/canonical comparison and git diff validation."
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

Check native Protect Sheet state in the Calc browser menu

Reconcile the sheet context menu tests with the existing native Protect Sheet checkbox and verify menu focus, selection, geometry and accessibility at both original widths.

## Scope

- In scope: Reconcile the sheet context menu tests with the existing native Protect Sheet checkbox and verify menu focus, selection, geometry and accessibility at both original widths.
- Out of scope: unrelated refactors not required for "Check native Protect Sheet state in the Calc browser menu".

## Plan

1. Confirm the missing checkbox expectation using the failure traces and pinned sheet-tab popup resource. 2. Assert that Protect Sheet is visible and unchecked on the fresh unprotected sheet. 3. Replay both existing width variants on the checkpoint build.

## Verify Steps

Replay both existing sheet context menu width variants against the running checkpoint, preserving focus, selection, geometry, accessibility and Undo assertions. Run focused lint, formatting, replay/canonical comparison and git diff validation.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
