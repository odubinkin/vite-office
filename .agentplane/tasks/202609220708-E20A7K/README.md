---
id: "202609220708-E20A7K"
title: "Align Writer lifecycle medium and browser storage ownership"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609220708-ACW8QC"
tags:
  - "code"
  - "frontend"
  - "parity"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity"
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage && npm run test:e2e"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:54.969Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-22T09:35:34.826Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-22T09:35:34.826Z"
doc_updated_by: "CODER"
description: "Implement P1.13-P1.15: consolidate lifecycle state on SfxObjectShell, SfxMedium and SwDocShell, collapse browser workflow pass-through layers, and relocate browser snapshot ownership out of sw/source/filter/basflt."
sections:
  Summary: |-
    Align Writer lifecycle medium and browser storage ownership

    Implement P1.13-P1.15: consolidate lifecycle state on SfxObjectShell, SfxMedium and SwDocShell, collapse browser workflow pass-through layers, and relocate browser snapshot ownership out of sw/source/filter/basflt.
  Scope: |-
    - In scope: Implement P1.13-P1.15: consolidate lifecycle state on SfxObjectShell, SfxMedium and SwDocShell, collapse browser workflow pass-through layers, and relocate browser snapshot ownership out of sw/source/filter/basflt.
    - Out of scope: unrelated refactors not required for "Align Writer lifecycle medium and browser storage ownership".
  Plan: |-
    1. Move title, modified/save position, and primary-medium state to SfxObjectShell, SfxMedium, and SwDocShell; retain browser generations only for async races and leases.
    2. Route open/save/export/cache/transfer operations through the owning document shell, medium, transferable, or VCL browser port and remove pass-through controllers.
    3. Move browser cache snapshot code from sw/source/filter/basflt to sw/browser/storage and keep only genuine upstream filter responsibilities in basflt.
    4. Bump changed stored schemas and reject old versions without migration or compatibility paths.
    5. Update affected inventory/provenance/docs and verify dirty/save/recovery transitions, cancellation, races, cache failure isolation, and operation state.
  Verify Steps: |-
    1. Run focused SfxObjectShell, SfxMedium, SwDocShell, workflows, storage, recovery, and transferable tests. Expected: one lifecycle owner, correct save positions, race-safe generations, and isolated cache failures.
    2. Run npm run test:coverage && npm run test:e2e. Expected: unit coverage and browser open/save/export/recovery flows pass.
    3. Run npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: browser snapshot code has explicit browser ownership and basflt has no false browser persistence claim.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.
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

Align Writer lifecycle medium and browser storage ownership

Implement P1.13-P1.15: consolidate lifecycle state on SfxObjectShell, SfxMedium and SwDocShell, collapse browser workflow pass-through layers, and relocate browser snapshot ownership out of sw/source/filter/basflt.

## Scope

- In scope: Implement P1.13-P1.15: consolidate lifecycle state on SfxObjectShell, SfxMedium and SwDocShell, collapse browser workflow pass-through layers, and relocate browser snapshot ownership out of sw/source/filter/basflt.
- Out of scope: unrelated refactors not required for "Align Writer lifecycle medium and browser storage ownership".

## Plan

1. Move title, modified/save position, and primary-medium state to SfxObjectShell, SfxMedium, and SwDocShell; retain browser generations only for async races and leases.
2. Route open/save/export/cache/transfer operations through the owning document shell, medium, transferable, or VCL browser port and remove pass-through controllers.
3. Move browser cache snapshot code from sw/source/filter/basflt to sw/browser/storage and keep only genuine upstream filter responsibilities in basflt.
4. Bump changed stored schemas and reject old versions without migration or compatibility paths.
5. Update affected inventory/provenance/docs and verify dirty/save/recovery transitions, cancellation, races, cache failure isolation, and operation state.

## Verify Steps

1. Run focused SfxObjectShell, SfxMedium, SwDocShell, workflows, storage, recovery, and transferable tests. Expected: one lifecycle owner, correct save positions, race-safe generations, and isolated cache failures.
2. Run npm run test:coverage && npm run test:e2e. Expected: unit coverage and browser open/save/export/recovery flows pass.
3. Run npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: browser snapshot code has explicit browser ownership and basflt has no false browser persistence claim.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
