---
id: "202609231726-WJWRDD"
title: "Implement browser ODT autosave and Writer file workflows"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T17:26:21.371Z"
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
    body: "Start: Implement approved ODT autosave and Writer file workflows while preserving existing unrelated edits."
events:
  -
    type: "status"
    at: "2026-09-23T17:26:22.132Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved ODT autosave and Writer file workflows while preserving existing unrelated edits."
doc_version: 3
doc_updated_at: "2026-09-23T17:26:22.132Z"
doc_updated_by: "CODER"
description: "Replace durable JSON snapshots with ODT autosave, implement Save As/rename semantics and Open/Export dialogs, and document deliberate upstream divergence in parity inventory."
sections:
  Summary: |-
    Implement browser ODT autosave and Writer file workflows

    Replace durable JSON snapshots with ODT autosave, implement Save As/rename semantics and Open/Export dialogs, and document deliberate upstream divergence in parity inventory.
  Scope: |-
    - In scope: Replace durable JSON snapshots with ODT autosave, implement Save As/rename semantics and Open/Export dialogs, and document deliberate upstream divergence in parity inventory.
    - Out of scope: unrelated refactors not required for "Implement browser ODT autosave and Writer file workflows".
  Plan: "1. Replace durable JSON snapshot storage with ODT bytes and atomic metadata, including one-time legacy migration. 2. Add dirty-aware 10-second autosave with one-second idle, 30-second maximum, UI capture deferral, serialized writes, and exact generation acknowledgement. 3. Implement browser Save As copy and atomic rename move with collision refusal. 4. Implement Open browser/computer tabs (ODT/TXT) and Export format dialog; remove manual Save. 5. Record intentional upstream divergences in canonical docs and parity inventory. 6. Verify targeted tests, build, routing, doctor, and changed scope."
  Verify Steps: "1. Run targeted Writer storage, workflow, dialog, and autosave tests: ODT round trip, legacy migration, rename collision safety, Save As copy, TXT/ODT open, export, 10-second/idle/cap/UI timing, concurrent edits, and undo retention. 2. Run npm run verify and confirm all repository gates pass. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor. 4. Inspect docs/program/autosave-recovery.md and parity inventory to confirm intentional upstream divergence is recorded."
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

Implement browser ODT autosave and Writer file workflows

Replace durable JSON snapshots with ODT autosave, implement Save As/rename semantics and Open/Export dialogs, and document deliberate upstream divergence in parity inventory.

## Scope

- In scope: Replace durable JSON snapshots with ODT autosave, implement Save As/rename semantics and Open/Export dialogs, and document deliberate upstream divergence in parity inventory.
- Out of scope: unrelated refactors not required for "Implement browser ODT autosave and Writer file workflows".

## Plan

1. Replace durable JSON snapshot storage with ODT bytes and atomic metadata, including one-time legacy migration. 2. Add dirty-aware 10-second autosave with one-second idle, 30-second maximum, UI capture deferral, serialized writes, and exact generation acknowledgement. 3. Implement browser Save As copy and atomic rename move with collision refusal. 4. Implement Open browser/computer tabs (ODT/TXT) and Export format dialog; remove manual Save. 5. Record intentional upstream divergences in canonical docs and parity inventory. 6. Verify targeted tests, build, routing, doctor, and changed scope.

## Verify Steps

1. Run targeted Writer storage, workflow, dialog, and autosave tests: ODT round trip, legacy migration, rename collision safety, Save As copy, TXT/ODT open, export, 10-second/idle/cap/UI timing, concurrent edits, and undo retention. 2. Run npm run verify and confirm all repository gates pass. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor. 4. Inspect docs/program/autosave-recovery.md and parity inventory to confirm intentional upstream divergence is recorded.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
