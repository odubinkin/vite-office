---
id: "202609241521-P6BCN2"
title: "Close certification ODT whole-document acceptance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241521-Q9V21Y"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run private sample acceptance and representative upstream ODT matrix; record semantic deltas, warning categories and UI persistence."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:17.972Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
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
    body: "Start: close whole-document ODT acceptance and compatibility contract."
events:
  -
    type: "status"
    at: "2026-09-24T22:04:02.244Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: close whole-document ODT acceptance and compatibility contract."
doc_version: 3
doc_updated_at: "2026-09-24T22:04:02.244Z"
doc_updated_by: "CODER"
description: "Phase 6: private sample Open/render/edit/Save As/reopen acceptance, upstream fixture matrix and documented ODT contract/parity limitations."
sections:
  Summary: |-
    Close certification ODT whole-document acceptance

    Phase 6: private sample Open/render/edit/Save As/reopen acceptance, upstream fixture matrix and documented ODT contract/parity limitations.
  Scope: "Whole-document private sample and upstream fixture matrix acceptance, UI persistence, ODT contract and parity documentation."
  Plan: |-
    1. Run Open/render/edit/Save As/reopen on the private sample and representative pinned ODTs.
    2. Compare the phase 0 semantic inventory and classified diagnostics.
    3. Inspect/edit imported settings through dialogs; save and reopen.
    4. Update ODT contract, parity matrix and user-facing limitations with verified evidence.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. Representative pinned fixtures from phases 0–5 and private sample pass the acceptance commands with exact results recorded.
    3. No uncaught errors, repetitive expected-feature warnings or lost text/cells; supported semantic inventory remains stable across repeated save/reopen.
    4. All remaining omissions have targeted tests or explicit follow-up, and docs match verified behavior.
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

Close certification ODT whole-document acceptance

Phase 6: private sample Open/render/edit/Save As/reopen acceptance, upstream fixture matrix and documented ODT contract/parity limitations.

## Scope

Whole-document private sample and upstream fixture matrix acceptance, UI persistence, ODT contract and parity documentation.

## Plan

1. Run Open/render/edit/Save As/reopen on the private sample and representative pinned ODTs.
2. Compare the phase 0 semantic inventory and classified diagnostics.
3. Inspect/edit imported settings through dialogs; save and reopen.
4. Update ODT contract, parity matrix and user-facing limitations with verified evidence.

## Verify Steps

1. `npm run verify` passes.
2. Representative pinned fixtures from phases 0–5 and private sample pass the acceptance commands with exact results recorded.
3. No uncaught errors, repetitive expected-feature warnings or lost text/cells; supported semantic inventory remains stable across repeated save/reopen.
4. All remaining omissions have targeted tests or explicit follow-up, and docs match verified behavior.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
