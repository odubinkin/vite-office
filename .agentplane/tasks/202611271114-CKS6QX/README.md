---
id: "202611271114-CKS6QX"
title: "Reconcile Calc formatting toolbar browser expectations"
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
  updated_at: "2026-11-27T11:14:22.441Z"
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
    body: "Start: reconcile the Calc formatting toolbar scenario with the pinned native resources."
events:
  -
    type: "status"
    at: "2026-11-27T11:14:22.810Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reconcile the Calc formatting toolbar scenario with the pinned native resources."
doc_version: 3
doc_updated_at: "2026-11-27T11:14:22.810Z"
doc_updated_by: "CODER"
description: "Align the stale browser assertion with the visible Calc formatobjectbar commands and actual single-cell merge sensitivity. Preserve the existing end-to-end formatting and ODS-adjacent behavior checked at both widths."
sections:
  Summary: |-
    Reconcile Calc formatting toolbar browser expectations

    Align the stale browser assertion with the visible Calc formatobjectbar commands and actual single-cell merge sensitivity. Preserve the existing end-to-end formatting and ODS-adjacent behavior checked at both widths.
  Scope: |-
    - In scope: Align the stale browser assertion with the visible Calc formatobjectbar commands and actual single-cell merge sensitivity. Preserve the existing end-to-end formatting and ODS-adjacent behavior checked at both widths.
    - Out of scope: unrelated refactors not required for "Reconcile Calc formatting toolbar browser expectations".
  Plan: "1. Check the two failures and the pinned formatobjectbar entries. 2. Correct the browser assertions for native merge and number format controls, including initial single-cell sensitivity. 3. Replay the desktop and mobile scenario against the unchanged checkpoint build."
  Verify Steps: "Verify the same two Chromium formatting toolbar scenarios on the running checkpoint build, then validate formatting, lint and the exact test diff. Preserve all existing formatting, accessibility and history assertions."
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

Reconcile Calc formatting toolbar browser expectations

Align the stale browser assertion with the visible Calc formatobjectbar commands and actual single-cell merge sensitivity. Preserve the existing end-to-end formatting and ODS-adjacent behavior checked at both widths.

## Scope

- In scope: Align the stale browser assertion with the visible Calc formatobjectbar commands and actual single-cell merge sensitivity. Preserve the existing end-to-end formatting and ODS-adjacent behavior checked at both widths.
- Out of scope: unrelated refactors not required for "Reconcile Calc formatting toolbar browser expectations".

## Plan

1. Check the two failures and the pinned formatobjectbar entries. 2. Correct the browser assertions for native merge and number format controls, including initial single-cell sensitivity. 3. Replay the desktop and mobile scenario against the unchanged checkpoint build.

## Verify Steps

Verify the same two Chromium formatting toolbar scenarios on the running checkpoint build, then validate formatting, lint and the exact test diff. Preserve all existing formatting, accessibility and history assertions.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
