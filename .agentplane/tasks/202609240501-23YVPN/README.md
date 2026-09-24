---
id: "202609240501-23YVPN"
title: "Align upstream paths and remove redundant adapters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609240501-GVMCJY"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T08:28:30.229Z"
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
    body: "Start: trace adapter callers, remove proven residue, reconcile paths, and verify."
events:
  -
    type: "status"
    at: "2026-09-24T08:28:37.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace adapter callers, remove proven residue, reconcile paths, and verify."
doc_version: 3
doc_updated_at: "2026-09-24T08:28:37.534Z"
doc_updated_by: "CODER"
description: "Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports"
sections:
  Summary: |-
    Align upstream paths and remove redundant adapters

    Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports
  Scope: |-
    - In scope: Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports.
    - Out of scope: unrelated refactors not required for "Align upstream paths and remove redundant adapters".
  Plan: |-
    1. Trace callers and producers for GetCommands, writer-command-surfaces, reverse page adapters, text-run projection, transfer DTOs, and remaining mapped path divergences against pinned upstream responsibility.
    2. Remove proven unused/pass-through layers and move any remaining domain policy into the corresponding upstream-shaped owner; retain genuine React, DOM, Worker, storage, clipboard and device boundaries.
    3. Reconcile source-provenance, runtime-inventory data and source-tree path list without changing schemas or verification logic.
    4. Run focused checks and npm run verify, review the diff, commit and close.
  Verify Steps: |-
    1. Caller tracing proves each deleted alias/reexport/adapter is unused or pass-through; upstream-shaped ownership remains in the mapped implementation, with browser ports retained where required.
    2. No production import references a removed path; supported command, layout, clipboard, ODT, and React behavior passes focused checks.
    3. Every moved or removed path is reconciled in source-provenance.json, runtime-inventory.json and source-tree documentation/data without schema changes.
    4. npm run verify passes, source-tree/provenance validations pass, and the final tracked state is clean.
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

Align upstream paths and remove redundant adapters

Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports

## Scope

- In scope: Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports.
- Out of scope: unrelated refactors not required for "Align upstream paths and remove redundant adapters".

## Plan

1. Trace callers and producers for GetCommands, writer-command-surfaces, reverse page adapters, text-run projection, transfer DTOs, and remaining mapped path divergences against pinned upstream responsibility.
2. Remove proven unused/pass-through layers and move any remaining domain policy into the corresponding upstream-shaped owner; retain genuine React, DOM, Worker, storage, clipboard and device boundaries.
3. Reconcile source-provenance, runtime-inventory data and source-tree path list without changing schemas or verification logic.
4. Run focused checks and npm run verify, review the diff, commit and close.

## Verify Steps

1. Caller tracing proves each deleted alias/reexport/adapter is unused or pass-through; upstream-shaped ownership remains in the mapped implementation, with browser ports retained where required.
2. No production import references a removed path; supported command, layout, clipboard, ODT, and React behavior passes focused checks.
3. Every moved or removed path is reconciled in source-provenance.json, runtime-inventory.json and source-tree documentation/data without schema changes.
4. npm run verify passes, source-tree/provenance validations pass, and the final tracked state is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
