---
id: "202611271059-WWVNRD"
title: "Reconcile Writer browser assertions from the ODF checkpoint"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "verification"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T10:59:26.644Z"
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
    body: "Start: reconcile the replayed browser assertions from the scheduled ODF checkpoint."
events:
  -
    type: "status"
    at: "2026-11-27T10:59:27.265Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reconcile the replayed browser assertions from the scheduled ODF checkpoint."
doc_version: 3
doc_updated_at: "2026-11-27T10:59:27.265Z"
doc_updated_by: "CODER"
description: "Update the stale logical cell-alignment expectation and wait for the imported neighbor content before reading DOM style invariants in two history scenarios. Keep the pinned Chromium application build and replay the three affected scenarios."
sections:
  Summary: |-
    Reconcile Writer browser assertions from the ODF checkpoint

    Update the stale logical cell-alignment expectation and wait for the imported neighbor content before reading DOM style invariants in two history scenarios. Keep the pinned Chromium application build and replay the three affected scenarios.
  Scope: |-
    - In scope: Update the stale logical cell-alignment expectation and wait for the imported neighbor content before reading DOM style invariants in two history scenarios. Keep the pinned Chromium application build and replay the three affected scenarios.
    - Out of scope: unrelated refactors not required for "Reconcile Writer browser assertions from the ODF checkpoint".
  Plan: "1. Confirm the actual Chromium failures using their traces. 2. Change the default adjacent-cell alignment expectation and synchronize the history neighbor CSS snapshots on imported paragraph text. 3. Replay only the three affected scenarios on the running checkpoint build and record the results."
  Verify Steps: "Run the affected cell and two paired-history browser scenarios against the same built checkpoint. Compare traces to updated expectations, check that the two specifications are the only edits and run lint, formatting and git diff validation."
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

Reconcile Writer browser assertions from the ODF checkpoint

Update the stale logical cell-alignment expectation and wait for the imported neighbor content before reading DOM style invariants in two history scenarios. Keep the pinned Chromium application build and replay the three affected scenarios.

## Scope

- In scope: Update the stale logical cell-alignment expectation and wait for the imported neighbor content before reading DOM style invariants in two history scenarios. Keep the pinned Chromium application build and replay the three affected scenarios.
- Out of scope: unrelated refactors not required for "Reconcile Writer browser assertions from the ODF checkpoint".

## Plan

1. Confirm the actual Chromium failures using their traces. 2. Change the default adjacent-cell alignment expectation and synchronize the history neighbor CSS snapshots on imported paragraph text. 3. Replay only the three affected scenarios on the running checkpoint build and record the results.

## Verify Steps

Run the affected cell and two paired-history browser scenarios against the same built checkpoint. Compare traces to updated expectations, check that the two specifications are the only edits and run lint, formatting and git diff validation.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
